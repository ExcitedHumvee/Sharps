const Sharp = require('../models/sharp');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const sharps = await Sharp.find({}).populate('popupText');
    res.render('sharps/index', { sharps })
}

module.exports.renderNewForm = (req, res) => {
    res.render('sharps/new');
}

module.exports.createSharp = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.sharp.location,
        limit: 1
    }).send()
    const sharp = new Sharp(req.body.sharp);
    sharp.geometry = geoData.body.features[0].geometry;
    sharp.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    sharp.author = req.user._id;
    await sharp.save();
    console.log(sharp);
    req.flash('success', 'Successfully made a new sharp!');
    res.redirect(`/sharps/${sharp._id}`)
}

module.exports.showSharp = async (req, res,) => {
    const sharp = await Sharp.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!sharp) {
        req.flash('error', 'Cannot find that sharp!');
        return res.redirect('/sharps');
    }
    res.render('sharps/show', { sharp });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const sharp = await Sharp.findById(id)
    if (!sharp) {
        req.flash('error', 'Cannot find that sharp!');
        return res.redirect('/sharps');
    }
    res.render('sharps/edit', { sharp });
}

module.exports.updateSharp = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const sharp = await Sharp.findByIdAndUpdate(id, { ...req.body.sharp });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    sharp.images.push(...imgs);
    await sharp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await sharp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated sharp!');
    res.redirect(`/sharps/${sharp._id}`)
}

module.exports.deleteSharp = async (req, res) => {
    const { id } = req.params;
    await Sharp.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted sharp')
    res.redirect('/sharps');
}