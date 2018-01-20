(function() {
	'use strict';

	angular
		.module('podstationApp')
		.factory('socialService', ['$window','podcastManagerService', socialService]);

	function socialService($window, podcastManagerService) {
		var service = {
			tweet: tweet,
			shareWithFacebook: shareWithFacebook,
			getUrlForHandle: getUrlForHandle,
			getIconForHandle: getIconForHandle,
			getTextForHandle: getTextForHandle
		};

		function tweet(episodeId) {
			podcastManagerService.getPodcastAndEpisode(episodeId).then(function(result) {
				// https://dev.twitter.com/web/intents
				var tweetUrl;

				tweetUrl = 'https://twitter.com/intent/tweet?' + $.param({
					text: result.episode.title,
					url: result.episode.link ? result.episode.link : result.episode.enclosure.url, 
					hashtags: 'podcast,podstation', 
					via: 'podstation_app'
				});

				$window.open(tweetUrl, '_blank', 'width=550,height=420');
			});
		}

		function shareWithFacebook(episodeId) {
			podcastManagerService.getPodcastAndEpisode(episodeId).then(function(result) {
				// https://developers.facebook.com/docs/sharing/reference/share-dialog#advancedtopics

				var shareUrl;

				shareUrl = 'https://www.facebook.com/dialog/share?' + $.param({
					app_id: '405324126571182',
					quote: result.episode.title,
					href: result.episode.link ? result.episode.link : result.episode.enclosure.url, 
					hashtag: '#podstation',
				});

				$window.open(shareUrl, '_blank', 'width=550,height=420');
			});
		}

		function getUrlForHandle(socialHandle) {
			switch(socialHandle.type) {
				case 'telegram':
				case 'telegram.group':
					return 'https://t.me/' + socialHandle.handle;
				case 'twitter':
					return 'https://twitter.com/' + socialHandle.handle;
				case 'youtube':
					return 'https://youtube.com/user/' + socialHandle.handle;
				case 'youtube.channel':
					return 'https://youtube.com/channel/' + socialHandle.handle;;
				case 'facebook':
				case 'facebook.page':
					return 'https://facebook.com/' + socialHandle.handle;;
				case 'facebook.group':
					return 'https://facebook.com/groups/' + socialHandle.handle;;
				case 'instagram':
					return 'https://instagram.com/' + socialHandle.handle;;
			}

			return socialHandle.url;
		}

		function getIconForHandle(socialHandle) {
			switch(socialHandle.type) {
				case 'telegram':
				case 'telegram.group':
					return 'telegram';
				case 'twitter':
					return 'twitter';
				case 'youtube':
				case 'youtube.channel':
					return 'youtube-play';
				case 'facebook':
				case 'facebook.page':
				case 'facebook.group':
					return 'facebook';
				case 'instagram':
					return 'instagram';
			}
		}

		function getTextForHandle(socialHandle) {
			switch(socialHandle.type) {
				case 'telegram':
				case 'telegram.group':
					return 'Telegram';
				case 'twitter':
					return 'Twitter';
				case 'youtube':
				case 'youtube.channel':
					return 'Youtube';
				case 'facebook':
					return 'Facebook';
				case 'facebook.page':
					return 'Facebook Page';
				case 'facebook.group':
					return 'Facebook Group';
				case 'instagram':
					return 'Instagram';
			}

			return socialHandle.text;
		}

		return service;
	}

})();