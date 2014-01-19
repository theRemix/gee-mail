var messages_inbox;

(function(){
  window.onload = function() {
    messages_inbox = document.getElementById("messages_inbox");
    populateInbox(); 
  }
})();


function populateInbox () {
  if(window.geemails.length > 0){
    // remove any empty_box messages since it's no longer empty
    messages_inbox.innerHTML = "";

    for(i in window.geemails){
      appendMessage(messages_inbox, window.geemails[i]);
    }
  }
}

function appendMessage (box, message) {
  var item = document.createElement("li");
  item.appendChild(spanElement("box_list_from", message.sender));
  item.appendChild(spanElement("box_list_subject", message.subject));
  item.appendChild(spanElement("box_list_date", message.date));
  item.setAttribute("data-body", message.body);
  item.onclick = click_message;
  box.appendChild(item);
}

function spanElement (class_name, inner) {
  var element = document.createElement('span');
  element.className = class_name;
  element.innerHTML = inner;
  return element;
}

function click_message () {
  
}