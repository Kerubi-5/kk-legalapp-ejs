// Load User model
const User = require("../models/User");
const Advice = require("../models/Advice");
const Complaint = require("../models/Complaint");

exports.index = async (req, res, next) => {
	try {
		const clientCount = await User.count({ user_type: "client" });
		const lawyerCount = await User.count({ user_type: "lawyer" });
		const advicesCount = await Advice.count({});
		const resolvedAdvicesCount = await Advice.count({ is_resolved: true });
		const complaintsCount = await Complaint.count({});
		const complaintsCompletedCount = await Complaint.count({
			case_status: "completed ",
		});

		res.render("./admin/dashboard", {
			layout: "./layouts/admin-layout",
			clientCount,
			lawyerCount,
			advicesCount,
			resolvedAdvicesCount,
			complaintsCount,
			complaintsCompletedCount,
		});
	} catch (err) {
		next(err);
	}
}

exports.accountsView = async (req, res, next) => {
	try {
		const accountsDoc = await User.find({
			is_locked: true,
		});

		res.render("./admin/accounts-authentication", {
			layout: "./layouts/admin-layout",
			accountsDoc,
		});
	} catch (err) {
		next(err);
	}
}

exports.lawyersView = async (req, res, next) => {
	try {
		const lawyerDocs = await User.find({
			user_type: "lawyer",
			is_locked: false,
		});
		res.render("./admin/lawyers", {
			layout: "./layouts/admin-layout",
			lawyerDocs,
		});
	} catch (err) {
		next(err);
	}
}

exports.clientsView = async (req, res, next) => {
	try {
		const clientDocs = await User.find({
			user_type: "client",
			is_locked: false,
		});
		res.render("./admin/clients", {
			layout: "./layouts/admin-layout",
			clientDocs,
		});
	} catch (err) {
		next(err);
	}
}

exports.findAccountByID = async (req, res, next) => {
	try {
		const id = req.params.id;
		const user_client = await User.findById({ _id: id });

		res.render("./admin/user-view", { layout: false, user: user_client });
	} catch (err) {
		next(err);
	}
}

exports.complaintView = async (req, res, next) => {
	const complaintResults = await Complaint.find({ is_verified: false })
		.populate("client_id")
		.populate("lawyer_id");
	res.render("./admin/pending", {
		layout: "./layouts/admin-layout",
		complaints: complaintResults,
	});
}

exports.findComplaintByID = async (req, res, next) => {
	const id = req.params.id;
	const complaintResult = await Complaint.findById({
		_id: id,
		is_verified: false,
	})
		.populate("client_id")
		.populate("lawyer_id");
	res.render("./admin/pending-view", {
		layout: false,
		result: complaintResult,
	});
}

exports.complaintVerify = async (req, res, next) => {
	const id = req.params.id;
	await Complaint.findByIdAndUpdate({ _id: id }, { is_verified: true });
	req.flash("success_msg", "Succesfully verified a complaint");
	res.redirect("/admin/pending");
}

exports.unlockUserByID = async (req, res, next) => {
	try {
		const id = req.params.id;

		await User.findByIdAndUpdate({ _id: id }, { is_locked: false });
		req.flash("success_msg", "Successfully unlocked a user");
		res.redirect("/admin/accounts");
	} catch (err) {
		next(err);
	}
}

exports.lockUserByID = async (req, res, next) => {
	try {
		const id = req.params.id;

		await User.findByIdAndUpdate({ _id: id }, { is_locked: true });
		req.flash("success_msg", "Successfully locked account");
		res.redirect("/admin/accounts");
	} catch (err) {
		next(err);
	}
}
