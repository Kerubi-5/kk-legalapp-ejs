$(".close-notification").click(function () {
    var value = $(this).val()
    $(this).closest(".dropdown-item").remove()
    var counter = parseInt($(".notif-counter").text())
    counter = counter - 1
    if (counter == 0) {
        $(".notif-counter").remove()
    }

    $(".notif-counter").text(counter)

    $.ajax({
        method: "GET",
        url: "/notification/" + value
    })
})

$('ul .dropdown-menu .dropdown-item button').click(function (e) {
    e.stopPropagation();
});