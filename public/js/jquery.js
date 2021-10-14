$(".close-notification").click(function () {
    var value = $(this).val()
    $(this).closest(".dropdown-item").remove()
    var counter = parseInt($(".notif-counter").text())
    counter = counter - 1
    if (counter == 0)
        $(".notif-counter").remove()

    $(".notif-counter").text(counter)


    $.ajax({
        method: "GET",
        url: "/form/notification/" + value
    })
})