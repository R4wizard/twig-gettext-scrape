var Jed = require('jed');

var fs = require('fs');
var path = require('path');

var GT = function(options) {
	options = options || {};

	this.domain = options.domain || "messages";
	this.locale = options.default_locale || "en_GB";
	this.locale_path = options.locale_path || ".";
	this.available_locales = options.available_locales || ['en_GB'];

	this.loadAllLocaleData();

	this.i18n = new Jed({
		locale_data: this.locale_data,
		domain: this.domain + "-" + this.locale
	});

	if(options.twig)
		this.bindTwig(options.twig);
};

GT.prototype.loadAllLocaleData = function() {
	this.locale_data = {};
	for(var i = 0; i < this.available_locales.length; i++) {
		var locale = this.available_locales[i];
		this.locale_data[this.domain + "-" + locale] = this.getLocaleData(locale);
	}
};

GT.prototype.getLocaleData = function(locale) {
	var data = JSON.parse(fs.readFileSync(path.join(this.locale_path, locale + ".json")));
	var lang = data.locale_data[this.domain];
	lang[''].domain = this.domain + "-" + locale;
	return lang;
};

GT.prototype.setLocale = function(locale) {
	this.locale = locale || "en_GB";
};

GT.prototype.gettext = function(key) {
	try {
		return this.i18n.dgettext(this.domain + "-" + this.locale, key);
	} catch(e) { return key; }
};

GT.prototype.ngettext = function(single_key, plural_key, value) {
	try {
		return this.i18n.dngettext(this.domain + "-" + this.locale, single_key, plural_key, value);
	} catch(e) { return plural_key; }
};

GT.prototype.bindTwig = function(Twig) {
	Twig.extendFunction("__", this.gettext.bind(this));
	Twig.extendFunction("gettext", this.gettext.bind(this));
	Twig.extendFunction("__n", this.ngettext.bind(this));
	Twig.extendFunction("ngettext", this.ngettext.bind(this));
};

module.exports = GT;
