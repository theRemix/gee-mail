var UPDATE_INBOX_INTERVAL_MS = 5000;

var messages_inbox,
    message_preview,
    box_inbox_count;

(function(){
  window.onload = function() {
    messages_inbox = document.getElementById("messages_inbox");
    message_preview = document.getElementById("message_preview");
    box_inbox_count = document.getElementById("box_inbox_count");
    populateInbox(); 
  }

  window.setInterval(checkInbox, UPDATE_INBOX_INTERVAL_MS);
})();

function checkInbox () {
  var message = window.getNewMessage();
  prependMessage(messages_inbox, message);
  updateInboxCount();
}

function updateInboxCount () {
  var count = messages_inbox.childNodes.length;
  box_inbox_count.innerHTML = count;
}


function populateInbox () {
  if(window.geemails.length > 0){
    // remove any empty_box messages since it's no longer empty
    messages_inbox.innerHTML = "";

    for(i in window.geemails){
      prependMessage(messages_inbox, window.geemails[i]);
    }
  }

  updateInboxCount();
}

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
  item.onclick = click_message;
  box.insertBefore(item, box.childNodes[0]);
}

function spanElement (class_name, inner) {
  var element = document.createElement('span');
  element.className = class_name;
  element.innerHTML = inner;
  return element;
}

/*
  %dl
    %dt From
    %dd {{ sender }}
    %dt Subject
    %dd {{ subject }}
    %dt Date
    %dd {{ date }}

  .message_body {{ body }}
*/
function click_message () {
  // clear message_preview
  message_preview.innerHTML = "";

  var dl = document.createElement("dl");
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

  var message_body = document.createElement("div");
  message_body.className = "message_body";
  message_body.innerHTML = this.getAttribute("data-body");

  message_preview.appendChild(dl);
  message_preview.appendChild(message_body);

  // un'select' all others
  for(i=0; i<this.parentNode.childNodes.length; i++) {
    var msg = this.parentNode.childNodes[i];
    msg.className = (msg.getAttribute("data-unread") == "true")? "unread" : "";
  }

  // select this list item
  this.className = "selected";
  this.setAttribute("data-unread", false);
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