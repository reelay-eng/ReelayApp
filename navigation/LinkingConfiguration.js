/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

export default {
	prefixes: ["reelay://", "reelayapp://", "https://on.reelay.app/*"],
	config: {
		screens: {
			Authenticated: {
				screens: {
					FeedScreen: "FeedScreen",
					SelectTitleScreen: "SelectTitleScreen",
					ReelayCameraScreen: "ReelayCameraScreen",
					ReelayUploadScreen: "ReelayUploadScreen",
					ReelayInfoScreen: "ReelayInfoScreen",
					VenueSelectScreen: "VenueSelectScreen",
					MyProfileScreen: "MyProfileScreen",
					ProfileSettingsScreen: "ProfileSettingsScreen",
					NotificationSettingsScreen: "NotificationSettingsScreen",
					TMDBCreditScreen: "TMDBCreditScreen",
					ProfileFeedScreen: "ProfileFeedScreen",
					SingleReelayScreen: {
						path: "/reelay/:reelaySub",
						parse: {
							reelaySub: (reelaySub) => String(reelaySub),
						},
					},
				},
			},
			Unauthenticated: {
				screens: {
					ConfirmEmailScreen: "ConfirmEmailScreen",
					ForgotPasswordScreen: "ForgotPasswordScreen",
					ForgotPasswordSubmitScreen: "ForgotPasswordSubmitScreen",
					NewUserScreen: "NewUserScreen",
					SignedOutScreen: "SignedOutScreen",
					SignInScreen: "SignInScreen",
					SignUpScreen: "SignUpScreen",
					SplashScreen: "SplashScreen",
				},
			},
			NotFound: "*",
		},
	},
};
