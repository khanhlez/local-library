const Author = require("../models/author");
const Book = require("../models/book");

const asyncHandler = require("express-async-handler");
const {body, validationResult} = require("express-validator");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthor = await Author.find().sort({family_name: 1}).exec();

  res.render("author_list", {title: "Author List", author_list: allAuthor});
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author: req.params.id}, "title summary").exec()
  ]);

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Detail",
    author,
    author_books: allBooksByAuthor
  })
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", {title: "Create Author"});
});

// Handle Author create on POST.
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("First name must be specified")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death
    });

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author,
        errors: errors.array()
      });
    } else {
      await author.save();
      res.redirect(author.url)
    }
  })
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author: req.params.id}, "title summary").exec(),
  ]);

  if (author === null) {
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author,
    author_books: allBooksByAuthor
  })
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author: req.params.id}, "title summary").exec()
  ]);

  if (allBooksByAuthor.length > 0) {
    res.render("author_delete", {
      title: "Delete Author",
      author,
      author_books: allBooksByAuthor
    });
  } else {
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  const author = await Author.findById(req.params.id).exec();
  console.log('author', author)

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_form", {
    title: "Update Author",
    author
  });
});

// Handle Author update on POST.
exports.author_update_post = [
  // Validate and sanitize fields.
  body("first_name")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  body("family_name")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  body("date_of_birth", "Invalid date of birth")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid date of death")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id
    });

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Update Author",
        author,
        errors: errors.array()
      })
    } else {
      await Author.findByIdAndUpdate(req.params.id, author);
      res.redirect(author.url);
    }
  })
]
