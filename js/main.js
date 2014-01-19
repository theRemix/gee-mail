var UPDATE_INBOX_INTERVAL_MS = 12000;

// dom elements
var messages_inbox,
    messages_archived,
    messages_trash,
    message_preview,
    box_inbox_count,
    box_inbox,
    box_archive,
    box_trash;

// globals
var selected_message,
    selected_box;

(function(){
  window.onload = function() {
    selected_box = 
      messages_inbox = document.getElementById("messages_inbox");
    messages_archived = document.getElementById("messages_archived");
    messages_trash = document.getElementById("messages_trash");
    message_preview = document.getElementById("message_preview");
    box_inbox_count = document.getElementById("box_inbox_count");
    box_inbox = document.getElementById("box_inbox");
    box_archive = document.getElementById("box_archive");
    box_trash = document.getElementById("box_trash");
    
    // listeners
    box_inbox.onclick = clickInbox;
    box_archive.onclick = clickArchive;
    box_trash.onclick = clickTrash;

    // store some data to be retrieved later
    [messages_inbox,messages_archived,messages_trash].forEach(function (box) {
      // move the first empty_message into data for now.
      box.setAttribute("data-empty_message", box.getElementsByTagName("li")[0].innerHTML);
      box.removeChild(box.firstChild);
    });

    populateInbox();
  }

  window.setInterval(checkInbox, UPDATE_INBOX_INTERVAL_MS);
})();

// called once, on init
function populateInbox () {
  if(window.geemails.length > 0){

    for(i in window.geemails){
      prependMessage(messages_inbox, window.geemails[i]);
    }
  }

  updateEmptyBoxMessage(messages_inbox);

  updateInboxCount();
}

function clickInbox () {
  enableBox(messages_inbox);
}
function clickArchive () {
  enableBox(messages_archived);
}
function clickTrash () {
  enableBox(messages_trash);
}

function enableBox (box) {
  box_inbox.parentNode.className = (box == messages_inbox)? "active" : "";
  box_archive.parentNode.className = (box == messages_archived)? "active" : "";
  box_trash.parentNode.className = (box == messages_trash)? "active" : "";

  messages_inbox.className = (box != messages_inbox)? "hidden" : "";
  messages_archived.className = (box != messages_archived)? "hidden" : "";
  messages_trash.className = (box != messages_trash)? "hidden" : "";

  selected_box = box;
  updateEmptyBoxMessage(box);

  // empty the message preview
  message_preview.innerHTML = "";
}

function checkInbox () {
  var message = window.getNewMessage();
  prependMessage(messages_inbox, message);
  updateEmptyBoxMessage(messages_inbox);
  updateInboxCount();
}

function updateInboxCount () {
  // only count real messages
  var count = 0;
  var lis = messages_inbox.getElementsByTagName("li");
  for (var i = 0; i < lis.length; i++) {
    if(lis[i].className != "empty_box") count++;
  };
  box_inbox_count.innerHTML = count;
}

// from mail-generator.js
function prependMessage (box, message) {
  var item = document.createElement("li");
  item.appendChild(spanElement("box_list_from", message.sender));
  item.appendChild(spanElement("box_list_subject", message.subject));
  item.appendChild(spanElement("box_list_date", short_date(message.date)));
  item.setAttribute("data-from", message.sender);
  item.setAttribute("data-subject", message.subject);
  item.setAttribute("data-date", message.date);
  item.setAttribute("data-body", message.body);
  item.setAttribute("data-unread", true);
  item.className = "unread";
  item.onclick = clickMessage;
  box.insertBefore(item, box.firstChild);
}

function spanElement (class_name, inner) {
  var element = document.createElement('span');
  element.className = class_name;
  element.innerHTML = inner;
  return element;
}

/*
  %dl#message_info
    %dt From
    %dd {{ sender }}
    %dt Subject
    %dd {{ subject }}
    %dt Date
    %dd {{ date }}
  #message_actions
    %button#button_archive Archive
    %button#button_delete Delete
  .clear
  #message_body {{ body }}

*/
function clickMessage () {
  // clear message_preview
  message_preview.innerHTML = "";

  // message info
  var dl = document.createElement("dl");
  dl.id = "message_info";
  var dt = document.createElement("dt");
  dt.innerHTML = "From : ";
  dl.appendChild(dt);

  var dd = document.createElement("dd");
  dd.innerHTML = this.getAttribute("data-from");
  dl.appendChild(dd);
  
  dt = document.createElement("dt");
  dt.innerHTML = "Subject : ";
  dl.appendChild(dt);

  dd = document.createElement("dd");
  dd.innerHTML = this.getAttribute("data-subject");
  dl.appendChild(dd);

  dt = document.createElement("dt");
  dt.innerHTML = "Date : ";
  dl.appendChild(dt);

  dd = document.createElement("dd");
  dd.innerHTML = long_date(this.getAttribute("data-date"));
  dl.appendChild(dd);

  // message actions
  var message_actions = document.createElement("div");
  message_actions.id = "message_actions";

  var archive_button = document.createElement("button");
  archive_button.id = "button_archive";
  archive_button.innerHTML = "Archive";
  archive_button.onclick = clickMessageArchive;
  message_actions.appendChild(archive_button);

  var delete_button = document.createElement("button");
  delete_button.id = "button_delete";
  delete_button.innerHTML = "Delete";
  delete_button.onclick = clickMessageDelete;
  message_actions.appendChild(delete_button);

  // clear
  var clear = document.createElement("div");
  clear.className = "clear";

  // message body
  var message_body = document.createElement("div");
  message_body.id = "message_body";
  message_body.innerHTML = this.getAttribute("data-body");


  message_preview.appendChild(dl);
  message_preview.appendChild(message_actions);
  message_preview.appendChild(clear);
  message_preview.appendChild(message_body);



  // un'select' all others
  var messages_in_box = this.parentNode.getElementsByTagName("li");
  for(i=0; i<messages_in_box.length; i++) {
    var msg = messages_in_box[i];
    msg.className = (msg.hasAttribute("data-unread") && msg.getAttribute("data-unread") == "true")? "unread" : "";
  }

  this.setAttribute("data-unread", false);

  // select this list item
  selectMessage(this);
}

function clickMessageArchive () {
  // move message to messages_archived
  messages_archived.insertBefore(selected_message, messages_archived.firstChild);
  
  deselectMessage(selected_message);

  updateEmptyBoxMessage(selected_box);

  updateInboxCount();
}
function clickMessageDelete () {
  // move message to messages_trash
  messages_trash.insertBefore(selected_message, messages_trash.firstChild);

  deselectMessage(selected_message);

  updateEmptyBoxMessage(selected_box);

  updateInboxCount();
}

function selectMessage (message) {
  message.className = "selected";
  selected_message = message;
}
function deselectMessage (message) {
  message.className = "";
  selected_message = null;

  // empty the message preview
  message_preview.innerHTML = "";
}

/*
  each box comes with an %li.empty_box message
  call updateEmptyBoxMessage when switching active box
    or on archive or trash actions

  too sleepy to do it a better way
*/
function updateEmptyBoxMessage (box) {
  var empty_message = null;
  var box_messages = box.getElementsByTagName("li");
  
  if(box_messages.length > 1){ // not empty
    // find the empty message
    for (var i = box_messages.length -1; i >= 0; i--) {
      if(box_messages[i].className == "empty_box"){
        empty_message = box_messages[i];
        break;
      }
    }
    if(empty_message != null){
      box.removeChild(empty_message);
    }
  }else if(box_messages.length == 0) {
    // restore the empty_message, if it doesn't exist
    var empty_message = document.createElement("li");
    empty_message.className = "empty_box";
    empty_message.innerHTML = box.getAttribute("data-empty_message");
    box.appendChild(empty_message);
  }
}

function short_date (date) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return (m<=9 ? '0' + m : m) + '/' + (d <= 9 ? '0' + d : d) + '/' + y;
}
function long_date (date) {
  return date.toString(); 
}