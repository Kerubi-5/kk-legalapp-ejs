// Load User model
const User = require("../models/User");
const Notification = require("../models/Notification");
const Advice = require("../models/Advice");

// Enum
const RoutesEnum = require("./EnumTypes/RoutesEnum");

exports.index = async (req, res, next) => {
  try {
    const id = req.user._id;

    // DATA VARIABLE QUERIES
    const filter = req.query.filter;
    let advicesDoc;

    const notifications = await Notification.find({ target: id });

    // APPLY SEARCH LOGIC HERE
    if (filter) {
      advicesDoc = await Advice.find({
        legal_title: new RegExp(filter, "i"),
      }).sort({ date_submitted: "desc" });
    } else {
      advicesDoc = await Advice.find({}).sort({ date_submitted: "desc" });
    }

    res.render("./advice/index", {
      currentUser: req.user,
      notifications,
      advices: advicesDoc,
      page_name: RoutesEnum.ADVICE,
    });
  } catch (err) {
    next(err);
  }
};

exports.adminPost = async (req, res, next) => {
  const user_id = req.user._id;
  const notifications = await Notification.find({ target: user_id });

  res.render("./advice/advice-sample", {
    currentUser: req.user,
    notifications,
  });
};

exports.submitPost = async (req, res, next) => {
  try {
    const id = req.user._id;
    const { legal_title, legal_description } = req.body;

    const newAdvice = new Advice({
      client_id: id,
      legal_title: legal_title,
      legal_description: legal_description,
    });

    await newAdvice.save();

    res.redirect("/advice");
  } catch (err) {
    next(err);
  }
};

exports.findPostById = async (req, res, next) => {
  try {
    const id = req.user._id;
    const advice_id = req.params.id;

    const notifications = await Notification.find({ target: id });
    const adviceDoc = await Advice.findOne({ _id: advice_id }).populate(
      "lawyers._id"
    );
    const userDoc = await User.findOne({ _id: adviceDoc.client_id });
    const lawyersDoc = adviceDoc.lawyers;
    const loginDoc = await User.findOne({ _id: id });

    if (typeof adviceDocs == undefined) adviceDocs = null;

    res.render("./advice/advice-view", {
      currentUser: req.user,
      notifications,
      adviceDoc,
      userDoc,
      lawyersDoc,
      loginDoc,
    });
  } catch (err) {
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  try {
    const id = req.user._id;
    const advice_id = req.params.id;
    const { answer } = req.body;

    const lawyer = {
      _id: id,
      answer: answer,
    };

    const adviceDoc = await Advice.findByIdAndUpdate(
      { _id: advice_id },
      { $push: { lawyers: lawyer } }
    );

    res.redirect("/advice/" + advice_id);
  } catch (err) {
    next(err);
  }
};

exports.markPostResolved = async (req, res, next) => {
  try {
    const vote_id = req.params.id;
    await Advice.findByIdAndUpdate({ _id: vote_id }, { is_resolved: true });

    res.redirect("/advice/" + vote_id);
  } catch (err) {
    next(err);
  }
};
