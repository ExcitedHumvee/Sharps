const Sharp = require('../models/sharp');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const sharp = await Sharp.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    sharp.reviews.push(review);
    await review.save();
    await sharp.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/sharps/${sharp._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Sharp.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/sharps/${id}`);
}
