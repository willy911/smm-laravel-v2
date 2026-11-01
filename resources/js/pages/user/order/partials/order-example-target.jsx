import {
    DiscordIcon,
    Facebook01Icon,
    GlobalIcon,
    InstagramIcon,
    Linkedin01Icon,
    PinterestIcon,
    ShoppingBag01Icon,
    SnapchatIcon,
    SoundcloudIcon,
    SpotifyIcon,
    TelegramIcon,
    TiktokIcon,
    TwitterIcon,
    YoutubeIcon,
} from 'hugeicons-react';
import { useTranslation } from 'react-i18next';

export default function OrderExampleTarget({ selectedService }) {
    const { t } = useTranslation();
    return (
        <div className="prose prose-sm text-sm">
            {/* <p>
                <strong>Contoh Pengisian Target Pesanan:</strong>
            </p> */}
            <ul>
                <li>
                    <strong className="flex items-center gap-1">
                        <InstagramIcon className="size-4" /> Instagram
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers, Story, Live, Profile Visits</i>
                            <div className="flex gap-1">
                                : <strong>my_username</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Likes, Views, Comments, Impressions</i>
                            <div className="flex gap-1">
                                : <strong>https://instagram.com/p/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Instagram TV</i>
                            <div className="flex gap-1">
                                : <strong>https://instagram.com/tv/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Reels</i>
                            <div className="flex gap-1">
                                : <strong>https://instagram.com/reel/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Highlights</i>
                            <div className="flex gap-1">
                                : <strong>https://instagram.com/stories/highlights/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Profile Visits</i>
                            <div className="flex gap-1">
                                : <strong>my_username</strong> {t('common:labels.or')} <strong>https://instagram.com/p/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <YoutubeIcon className="size-4" /> YouTube
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Likes, Views, Shares</i>
                            <div className="flex gap-1">
                                : <strong>https://youtube.com/watch?v=xxxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Live Stream</i>
                            <div className="flex gap-1">
                                : <strong>https://youtube.com/live/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Subscribers</i>
                            <div className="flex gap-1">
                                : <strong>https://youtube.com/@xxxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Shorts Views, Likes</i>
                            <div className="flex gap-1">
                                : <strong>https://youtube.com/shorts/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <Facebook01Icon className="size-4" /> Facebook
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Page Likes</i>
                            <div className="flex gap-1">
                                : <strong>https://facebook.com/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Profile Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://facebook.com/my_username/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Post Likes</i>
                            <div className="flex gap-1">
                                : <strong>https://m.facebook.com/story.php?story_fbid=xxxxx&id=xxxxx&mibextid=xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-2">
                    <strong className="flex items-center gap-1">
                        <TwitterIcon className="size-4" /> Twitter/X
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>my_username</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Retweet</i>
                            <div className="flex gap-1">
                                : <strong>https://twitter.com/xxxxx/status/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <TiktokIcon className="size-4" /> TikTok
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://tiktok.com/@my_username</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Likes/Views</i>
                            <div className="flex gap-1">
                                : <strong>https://tiktok.com/@my_username/video/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <ShoppingBag01Icon className="size-4" /> Shopee
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>my_username</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Product Likes</i>
                            <div className="flex gap-1">
                                : <strong>https://shopee.co.id/product.12345.xxxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Video Views</i>
                            <div className="flex gap-1">
                                : <strong>https://id.shp.ee/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Live Stream</i>
                            <div className="flex gap-1">
                                : <strong>https://live.shopee.co.id/share?from=live&session=12345&viewer=100</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-2">
                    <strong className="flex items-center gap-1">
                        <GlobalIcon className="size-4" /> Website Traffic
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Website Traffic</i>
                            <div className="flex gap-1">
                                : <strong>https://domain.com/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <DiscordIcon className="size-4" /> Discord
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Members</i>
                            <div className="flex gap-1">
                                : <strong>https://discord.gg/xxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Add Friends</i>
                            <div className="flex gap-1">
                                : <strong>my_username#12345</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <SoundcloudIcon className="size-4" /> Soundcloud
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://soundcloud.com/my_username</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Plays</i>
                            <div className="flex gap-1">
                                : <strong>https://soundcloud.com/my_username/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <SpotifyIcon className="size-4" /> Spotify
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://open.spotify.com/user/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Playlist Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://open.spotify.com/playlist/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <TelegramIcon className="size-4" /> Telegram
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Channel Members</i>
                            <div className="flex gap-1">
                                : <strong>https://t.me/channel_name</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Group Members</i>
                            <div className="flex gap-1">
                                : <strong>https://t.me/group_name</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <SnapchatIcon className="size-4" /> Snapchat
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>my_username</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Spotlight Views</i>
                            <div className="flex gap-1">
                                : <strong>https://snapchat.com/spotlight/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <Linkedin01Icon className="size-4" /> LinkedIn
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Company Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://linkedin.com/company/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Post Likes</i>
                            <div className="flex gap-1">
                                : <strong>https://linkedin.com/posts/xxxxx</strong>
                            </div>
                        </div>
                    </li>
                </ul>

                <li className="mt-4">
                    <strong className="flex items-center gap-1">
                        <PinterestIcon className="size-4" /> Pinterest
                    </strong>
                </li>
                <ul>
                    <li>
                        <div className="grid grid-cols-[250px_1fr] gap-1">
                            <i>Followers</i>
                            <div className="flex gap-1">
                                : <strong>https://id.pinterest.com/xxxxx/</strong>
                            </div>
                        </div>
                    </li>
                </ul>
            </ul>
            {/* <ScrollBar orientation="horizontal" /> */}
        </div>
    );
}
