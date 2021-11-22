/**
 * -------------- HEADER ----------------
 */

// Remove notification
$(".close-notification").click(function () {
  var value = $(this).val();
  $(this).closest(".dropdown-item").remove();
  var counter = parseInt($(".notif-counter").text());
  counter = counter - 1;
  if (counter == 0) {
    $(".notif-counter").remove();
  }

  $(".notif-counter").text(counter);

  $.ajax({
    method: "GET",
    url: "/notification/" + value,
  });
});

$("ul .dropdown-menu .dropdown-item button").click(function (e) {
  e.stopPropagation();
});

/**
 * -------------- DASHBOARD ----------------
 */

// INDEX DASHBOARD COMPLAINT SUBMIT
$(document).ready(function () {
  $(".to1").on("click", function () {
    $("#step1").fadeIn("slow");
    $("#step2").hide();
    $("#step3").hide();
  });

  $(".to2").on("click", function () {
    $("#step1").hide();
    $("#step2").fadeIn("slow");
    $("#step3").hide();
  });

  $(".to3").on("click", function () {
    const legal_title = $("#step1 #legal_title").val();
    const case_facts = $("#step1 #case_facts").val();
    const adverse_party = $("#step1 #adverse_party").val();
    const case_objectives = $("#step1 #case_objectives").val();
    const client_questions = $("#step1 #client_questions").val();
    const lawyer_id = $("#step2 table input[name='lawyer_id']:checked").val();

    $("#step3 #legal_title2").val(legal_title);
    $("#step3 #case_facts2").val(case_facts);
    $("#step3 #adverse_party2").val(adverse_party);
    $("#step3 #case_objectives2").val(case_objectives);
    $("#step3 #client_questions2").val(client_questions);
    $("#step3 #lawyer_link2").attr("href", "/users/" + lawyer_id);

    $("#step1").hide();
    $("#step2").hide();
    $("#step3").fadeIn("slow");
  });
});

/**
 * -------------- COMPLAINT VIEW ----------------
 */

// COMPLAINT VIEW EDIT
function complaintModal(id) {
  var host = window.location.protocol + "//" + window.location.host;
  let url = host + "/form/complaints/edit/" + id;
  $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    success: (data) => {
      $("#editModal .modal-body #case_id").val(data._id);
      $("#editModal .modal-body #legal_title").val(data.legal_title);
      $("#editModal .modal-body #client_name").val(data.client_id.user_fname);
      $("#editModal .modal-body #case_facts").val(data.case_facts);
      $("#editModal .modal-body #adverse_party").val(data.adverse_party);
      $("#editModal .modal-body #case_objectives").val(data.case_objectives);
      $("#editModal .modal-body #lawyer_details").val(
        data.lawyer_id.user_fname
      );
      $("#editModal .modal-body #client_questions").val(data.client_questions);
      $("#editModal").modal("show");
    },
  });
}

$("#case_files").change(function () {
  let files = $(this)[0].files;
  let file_item = "";
  for (let i = 0; i < files.length; i++) {
    file_item += `<li class="file-item"> ${files[i].name} </li>`;
  }
  $("#file_list").html(file_item);
});

function solutionModal(id) {
  var host = window.location.protocol + "//" + window.location.host;
  let url = host + "/form/solution/edit/" + id;
  $.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    success: (data) => {
      $("#solutionForm").attr(
        "action",
        `/form/solution/edit/${data._id}?_method=PATCH`
      );
      $("#solutionModal .modal-body #summary").val(data.summary);
      $("#solutionModal .modal-body #recommendations").val(
        data.recommendations
      );
      $("#solutionModal .modal-body #video_link").val(data.video_link);
      $("#solutionModal").modal("show");
    },
  });
}

/**
 * -------------- PROFILE EDIT ----------------
 */

// PROFILE BACKGROUND LAWYER SIDE EDIT
// add row
$("#addRow").click(() => {
  const html = `
          <div class="inputFormRow">
              <hr>
              <div class="col-12">
                  <label for="organization" class="form-label">Organization</label>
                  <input name="organization[]" type="text" class="form-control" id="organization"
                      placeholder="Polytechnic University of the Philippines" required>
              </div>
              <div class="col-12">
                  <label for="description" class="form-label">Description</label>
                  <input name="description[]" type="text" class="form-control" id="description"
                      placeholder="Bachelors of Degree" required>
              </div>
                  <button type="button" class="removeRow mt-3 mb-3 btn btn-danger">Remove</button>
          </div>
      `;

  $("#backgroundRow").append(html);
});

// remove row
$("#backgroundRow").on("click", ".removeRow", function () {
  $(this).closest(".inputFormRow").remove();
});

/**
 * -------------- ADVICE ----------------
 */

// ADVICE SEACH BAR
$("#search_text").keyup(() => {
  value = $("#search_text").val();
  $("#search_query").attr("href", "/advice?filter=" + value);
});
