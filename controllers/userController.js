const authUtils = require("../utils/crypto");

// Load User model
const User = require("../models/User");
const Notification = require("../models/Notification");

// Enum
const RolesEnum = require("./EnumTypes/AuthRoles")

// Node Mailer
const sendMail = require("../utils/transporter");

exports.userRegister = async (req, res, next) => {
	try {
		const {
			username,
			email,
			password,
			password2,
			user_fname,
			user_lname,
			birthdate,
			contact_number,
			permanent_address,
			user_type,
		} = req.body;

		let errors = [];

		if (!req.files)
			errors.push({ msg: "There is no pdf file credential uploaded" });

		if (
			!username ||
			!email ||
			!password ||
			!password2 ||
			!user_fname ||
			!user_lname ||
			!birthdate ||
			!contact_number ||
			!permanent_address
		)
			errors.push({ msg: "Please enter all fields" });

		if (username.length > 20)
			errors.push({ msg: "Username cannot be longer than 20 characters" });

		if (password != password2) errors.push({ msg: "Passwords do not match" });

		if (password.length < 6 || password.length > 20)
			errors.push({
				msg: "Password must be at least 6 characters, and not more than 20 characters long",
			});

		const user_identifier = (user_type) => {
			if (user_type == RolesEnum.LAWYER) return "register-lawyer";
			else if (user_type == RolesEnum.CLIENT) return "register-client";
			else return false;
		};

		function renderPage() {
			res.render(user_identifier(user_type), {
				errors,
				username,
				email,
				password,
				password2,
				user_fname,
				user_lname,
				birthdate,
				contact_number,
				permanent_address,
			});
		}

		if (errors.length > 0) {
			renderPage();
		} else {
			const userExists = await User.findOne({ username: username });
			const emailExists = await User.findOne({ email: email });

			if (userExists || emailExists) {
				if (userExists) errors.push({ msg: "Username already exist" });
				if (emailExists) errors.push({ msg: "Email already exist" });
				renderPage();
			} else {
				const fileObj = req.files.credential;
				const credential =
					Date.now() + "-" + Math.round(Math.random() * 1e9) + fileObj.name;

				newUser = new User({
					username,
					email,
					password,
					user_fname,
					user_lname,
					birthdate,
					contact_number,
					permanent_address,
					user_type:
						user_type == RolesEnum.LAWYER ? RolesEnum.LAWYER : RolesEnum.CLIENT,
					credential,
				});

				fileObj.mv("./public/uploads/credentials/" + credential);

				newUser.password = authUtils.hashPassword(password);
				newUser.save();

				const rand = newUser._id;
				const title =
					"Registration confirmation with 3JBG Legal Web Application!";
				const link = "http://" + req.get("host") + "/verify?id=" + rand;
				const msg = `<h1>Hello ${user_fname},</h1><br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`;
				sendMail(email, title, msg);

				req.flash(
					"success_msg",
					"You are now registered please log in to continue"
				);
				res.redirect("/users/login");
			}
		}
	} catch (err) {
		next(err);
	}
}

exports.resendEmail = async (req, res, next) => {
	try {
		const rand = req.user._id;
		const myUser = await User.findOne({ _id: rand });
		const title = "Registration confirmation with 3JBG Legal Web Application!";
		const link = "http://" + req.get("host") + "/verify?id=" + rand;
		const msg = `<h1>Hello ${myUser.user_fname},</h1><br> Please Click on the link to verify your email.<br><a href=${link}>Click here to verify</a>`;
		sendMail(myUser.email, title, msg);

		res.redirect("/unverified");
	} catch (err) {
		next(err);
	}
}

exports.userView = async (req, res, next) => {
	const id = req.user._id;
	const _id = req.params.id;

	try {
		const result = await User.findById({ _id });
		if (result) {
			const notifications = await Notification.find({ target: id });
			res.render("public-profile", {
				result,
				currentUser: req.user,
				param_id: _id,
				notifications,
			});
		} else {
			throw new Error("There is no user with that ID");
		}
	} catch (err) {
		next(err);
	}
}

exports.editUserView = (req, res, next) => {
	const id = req.user._id;

	try {
		if (id == req.params.id) {
			User.findOne({ _id: id }, async (err, result) => {
				if (err) next(err);

				const notifications = await Notification.find({ target: id });

				res.render("profile-edit", {
					result,
					currentUser: req.user,
					notifications,
				});
			});
		} else {
			throw new Error(
				"You do not have authority to view that profile's edit page"
			);
		}
	} catch (err) {
		next(err);
	}
}

exports.editUserPatch = async (req, res, next) => {
	try {
		const filter = req.params.id;
		const update = req.body;

		const {
			user_fname,
			user_lname,
			birthdate,
			contact_number,
			permanent_address,
			organization,
			description,
			user_type,
		} = req.body;

		let background = [];

		if (user_type == RolesEnum.LAWYER && organization && description) {
			if (Array.isArray(organization) && Array.isArray(description)) {
				const mapArrays = (options, values) => {
					const res = [];
					for (let i = 0; i < options.length; i++) {
						res.push({
							organization: options[i],
							description: values[i],
						});
					}
					return res;
				};
				background = mapArrays(organization, description);
			} else {
				background.push({
					organization,
					description,
				});
			}
		}

		// This does not work, add a new patch for background
		await User.findByIdAndUpdate(
			{ _id: filter },
			{ user_fname, user_lname, birthdate, contact_number, permanent_address }
		);

		if (user_type == RolesEnum.LAWYER && organization && description) {
			await User.findByIdAndUpdate({ _id: filter }, { $set: { background } });
		} else if (user_type == RolesEnum.LAWYER) {
			await User.findByIdAndUpdate({ _id: filter }, { $unset: { background } });
		}

		req.flash("success_msg", "Profile Succesfully Updated");
		res.redirect("/users/" + filter);
	} catch (err) {
		next(err);
	}
}

exports.setProfileVisibility = async (req, res, next) => {
	try {
		const filter = req.params.id;
		const update = await User.findOne({ _id: filter });
		is_public = !update.is_public;
		await User.findOneAndUpdate({ _id: filter }, { is_public });
		const message = !update.is_public ? "public" : "private";

		req.flash("success_msg", `Profile is now ${message}`);
		res.redirect("/users/" + filter);
	} catch (err) {
		next(err);
	}
}

exports.setLawyerAvailability = async (req, res, next) => {
	try {
		const filter = req.params.id;
		const { start_date, end_date } = req.body;
		const availability = {
			start_date: start_date,
			end_date: end_date,
		};

		await User.findByIdAndUpdate(filter, {
			$set: { availability: availability },
		});

		req.flash(
			"success_msg",
			`You are now available through dates ${availability.start_date} to ${availability.end_date}`
		);
		res.redirect("/users/" + filter);
	} catch (err) {
		next(err);
	}
}