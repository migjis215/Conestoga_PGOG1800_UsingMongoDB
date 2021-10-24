setTimeout(function () {
    if ($("#validation").val() == "complete") {
        var position = 0;
        var moving = setInterval(move, 10);
        function move() {
            if (position == 280) {
                clearInterval(moving);
            } else {
                position++;
                // element.style.left = position + "px";
                $("#truck").css("left", position + "px");
            }
        }
    }
}, 100);