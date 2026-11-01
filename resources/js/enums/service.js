import { CancelCircleIcon, CheckmarkCircle01Icon } from 'hugeicons-react';

export const serviceTypes = {
    primary: 'Primary',
    package: 'Package',
    custom_comments: 'Custom Comments',
    custom_comments_package: 'Custom Comments Package',
    comment_likes: 'Comment Likes',
    comment_replies: 'Comment Replies',
    mentions_hashtag: 'Mentions Hashtag',
    mentions_with_hashtags: 'Mentions With Hashtags',
    mentions_custom_list: 'Mentions Custom List',
    mentions_user_followers: 'Mentions User Followers',
    mentions_media_likers: 'Mentions Media Likers',
    poll: 'Poll',
    subscriptions: 'Subscriptions',
};

export const serviceRecommendations = {
    1: {
        label: 'common:labels.yes',
        icon: CheckmarkCircle01Icon,
        variant: 'success',
        textColor: 'text-green-500',
    },
    0: {
        label: 'common:labels.no',
        icon: CancelCircleIcon,
        variant: 'destructive',
        textColor: 'text-destructive',
    },
};

export const serviceRecommendationKeys = Object.keys(serviceRecommendations);

export const serviceRecommendationOptions = Object.entries(serviceRecommendations).map(([key, value]) => ({
    value: key,
    label: value.label,
}));
