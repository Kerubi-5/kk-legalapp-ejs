// Models
const Solution = require("../models/Solution");
const Complaint = require("../models/Complaint");
const User = require("../models/User")
const Notification = require("../models/Notification")

// Enums
const CaseStatusesEnum = require("./EnumTypes/CaseStatusesEnum")

exports.getSolutionDetails = async (req, res, next) => {
	try {
		const solution_id = req.params.id;
		const result = await Solution.findById({ _id: solution_id });
		res.json(result);
	} catch (err) {
		next(err);
	}
}

exports.patchSolutionDetails = async (req, res, next) => {
	try {
		const solution_id = req.params.id;
		const { summary, recommendations, video_link } = req.body;

		const result = await Solution.findByIdAndUpdate(
			{ _id: solution_id },
			{ summary, recommendations, video_link }
		);

		req.flash(
			"success_msg",
			"Succesfully edited a solution with id:" + solution_id
		);
		res.redirect("/form/complaints/" + result.complaint_id);
	} catch (err) {
		next(err);
	}
}

exports.postSolution = async (req, res, next) => {
	try {
		const lawyer_id = req.user._id;
		const id = req.params.id;
		const { summary, recommendations, video_link } = req.body;

		const newSolution = new Solution({
			complaint_id: id,
			summary: summary,
			recommendations: recommendations,
			video_link: video_link,
			lawyer_in_charge: lawyer_id,
		});

		// Updating Complaint and Inserting new Solution
		const complaintResult = await Complaint.findOne({ _id: id });
		complaintResult.case_status = CaseStatusesEnum.ONGOING;
		complaintResult.complaint_status = CaseStatusesEnum.ONGOING;
		complaintResult.solutions.push(newSolution);
		await complaintResult.save();

		const lawyerDeets = await User.findOne({ _id: complaintResult.lawyer_id });

		const pushNotify = new Notification({
			complaint_id: complaintResult._id,
			message: "has updated your consultation request",
			actor: lawyerDeets.username,
			target: complaintResult.client_id,
		});

		await newSolution.save();
		await pushNotify.save();

		req.flash("success_msg", `Succesfully updated case with id: ${id}`);
		res.redirect("/form/complaints/" + id);
	} catch (err) {
		next(err);
	}
}
