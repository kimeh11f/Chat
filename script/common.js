$(document).ready(function () {
    this.onkeydown = function () {
        //F12
        if (event.keyCode == 123) {
            return false;
        }
    }
    this.ondragstart = function () {
        //if (event.srcElement.type != "text" && event.srcElement.type != "textarea") {
            return false;
        //}
    }
    this.onselectstart = function () {
        //if (event.srcElement.type != "text" && event.srcElement.type != "textarea") {
            return false;
        //}
    }
    this.oncontextmenu = function () {
        //if (event.srcElement.type != "text" && event.srcElement.type != "textarea") {
            return false;
        //}
    }
});