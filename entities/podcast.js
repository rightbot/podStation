var Podcast = function(url) {
	this.url = url;
	this.image = 'images/rss-alt-8x.png';
	this.status = 'new';
	this.episodes = [];

	this.getKey = function() {
		return 'podcast' + this.url;
	}

	this.store = function() {
		var storageObject = {};

		var storedPodcast = {};

		storedPodcast.title = this.title;
		storedPodcast.description = this.description;
		storedPodcast.link = this.link;
		storedPodcast.pubDate = this.pubDate;
		storedPodcast.image = this.image;
		storedPodcast.episodes = this.episodes;

		storageObject[this.getKey()] = storedPodcast;

		chrome.storage.local.set(storageObject);
	}

	this.deleteFromStorage = function() {
		chrome.storage.local.remove(this.getKey());
	}

	this.update = function(callback) {
		var that = this;

		this.status = 'updating';

		$.ajaxSetup({cache: false});

		$.get(this.url, function(data) {
			var xml = $(data);

			if(!xml.find('rss > channel')[0]) {
				that.status = 'failed';
				return;
			}

			that.title = xml.find('rss > channel > title').text();
			that.description = xml.find('rss > channel > description').text();
			that.link = xml.find('rss > channel > link').text();

			that.pubDate = xml.find('rss > channel > pubDate').text();
			if(that.pubDate === '') {
				that.pubDate = xml.find('rss > channel > lastBuildDate').text();
			}

			that.image = xml.find('rss > channel > image > url').text();
			if(that.image === "") {
				that.image = xml.find('rss > channel > image').attr('href');
			}

			that.episodes = [];

			xml.find('rss > channel > item').each(function() {
				var feedItem = $(this);
				var episode = {};
				var enclosure;

				episode.title = feedItem.find('title').text();
				episode.link = feedItem.find('link').text();
				episode.pubDate = feedItem.find('pubDate').text();
				episode.description = feedItem.find('description').text();
				enclosure = feedItem.find('enclosure');
				episode.enclosure = {
					url: enclosure.attr('url'),
					length: enclosure.attr('length'),
					type: enclosure.attr('type')
				};

				that.episodes.push(episode);
			});

			that.episodes.sort(byPubDateDescending);

			if(that.episodes[0] && that.episodes[0].pubDate  &&
				(
					that.pubDate === undefined || that.pubDate === '' ||
					(new Date(that.episodes[0].pubDate)) > (new Date(that.pubDate))
				)
			) {
				that.pubDate = that.episodes[0].pubDate;
			}

			that.status = 'loaded';

			that.store();

			if(typeof callback === "function") {
				callback(that);
			}

		}).fail(function() {
			that.status = 'failed';
		});
	}

	this.load = function(callback) {
		var that = this;

		var podcastKey = this.getKey();

		chrome.storage.local.get(podcastKey, function(storageObject) {
			if(storageObject && storageObject[podcastKey]) {
				var storedPodcast = storageObject[podcastKey];

				that.title = storedPodcast.title;
				that.description = storedPodcast.description;
				that.link = storedPodcast.link;
				that.pubDate = storedPodcast.pubDate;
				that.image = storedPodcast.image;
				that.episodes = storedPodcast.episodes;
				that.status = 'loaded';

				if(typeof callback === "function") {
					callback(that);
				}
			}
			else {
				that.update(callback);
			}
		});
	};
}
