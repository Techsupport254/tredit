import React from "react";
import { Card, Button, Dropdown, Menu, Tooltip } from "antd";
import {
	MoreOutlined,
	PlayCircleFilled,
	EditFilled,
	DeleteFilled,
	EyeOutlined,
	LikeOutlined,
	ShareAltOutlined,
	CloudUploadOutlined,
	LockOutlined,
} from "@ant-design/icons";
import PropTypes from "prop-types";

const Post = ({ item, onPublish, onUnpublish, onDelete }) => {
	const isDraft = item?.status?.privacyStatus === "private";
	const videoId = item?.id?.videoId || item?.id; // Ensure correct video ID

	// Ensure statistics exist before parsing
	const views = item?.statistics?.viewCount
		? parseInt(item.statistics.viewCount).toLocaleString()
		: "0";
	const likes = item?.statistics?.likeCount
		? parseInt(item.statistics.likeCount).toLocaleString()
		: "0";
	const shares = item?.statistics?.shareCount
		? parseInt(item.statistics.shareCount || 0).toLocaleString()
		: "0";

	// Ensure date exists before formatting
	const publishedDate = item?.snippet?.publishedAt
		? new Date(item.snippet.publishedAt).toLocaleDateString()
		: "Unknown";

	// Dropdown menu actions
	const menu = (
		<Menu className="rounded-lg shadow-lg">
			{isDraft ? (
				<Menu.Item
					key="publish"
					icon={<CloudUploadOutlined className="text-green-600" />}
					onClick={() => onPublish(videoId)}
				>
					Publish Video
				</Menu.Item>
			) : (
				<Menu.Item
					key="unpublish"
					icon={<LockOutlined className="text-orange-600" />}
					onClick={() => onUnpublish(videoId)}
				>
					Unpublish Video
				</Menu.Item>
			)}
			<Menu.Item
				key="edit"
				icon={<EditFilled className="text-blue-600" />}
				onClick={() =>
					window.open(
						`https://studio.youtube.com/video/${videoId}/edit`,
						"_blank"
					)
				}
			>
				Edit in YouTube Studio
			</Menu.Item>
			<Menu.Item
				key="delete"
				icon={<DeleteFilled className="text-red-600" />}
				onClick={() => onDelete(videoId)}
			>
				Delete Video
			</Menu.Item>
		</Menu>
	);

	return (
		<div className="group relative bg-white rounded-lg shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden">
			{/* Thumbnail with Play Button Overlay */}
			<div className="relative aspect-video overflow-hidden">
				<img
					alt="upload"
					src={item?.snippet?.thumbnails?.medium?.url || ""}
					className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
				/>
				<div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-all duration-300" />

				{/* Play Button - Appears on Hover */}
				<a
					href={`https://www.youtube.com/watch?v=${videoId}`}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
				>
					<Button
						shape="circle"
						size="large"
						className="bg-white/30 backdrop-blur-md hover:bg-white text-indigo-600 shadow-lg border-none p-3"
						icon={<PlayCircleFilled className="text-4xl" />}
					/>
				</a>

				{/* Video Status Badge (Draft or Public) */}
				<span
					className={`absolute top-2 left-2 px-3 py-1 text-xs font-semibold rounded-full ${
						isDraft ? "bg-orange-500" : "bg-green-500"
					} text-white shadow-md`}
				>
					{isDraft ? "Draft" : "Public"}
				</span>

				{/* Video Date Badge */}
				<span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
					{publishedDate}
				</span>
			</div>

			{/* Card Content */}
			<div className="p-5">
				{/* Video Title & More Options */}
				<div className="flex justify-between items-center">
					<Tooltip title={item?.snippet?.title} placement="top">
						<h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
							{item?.snippet?.title || "Untitled Video"}
						</h3>
					</Tooltip>

					<Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
						<Button
							shape="circle"
							className="border-0 shadow-none text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
						>
							<MoreOutlined className="text-xl" />
						</Button>
					</Dropdown>
				</div>

				{/* Analytics Section */}
				<div className="text-gray-600 text-sm flex justify-between mt-2 py-2">
					<span className="flex items-center gap-2">
						<EyeOutlined className="text-lg text-gray-400" />
						{views} views
					</span>
					<span className="flex items-center gap-2">
						<LikeOutlined className="text-lg text-gray-400" />
						{likes} likes
					</span>
					<span className="flex items-center gap-2">
						<ShareAltOutlined className="text-lg text-gray-400" />
						{shares} shares
					</span>
				</div>
			</div>
		</div>
	);
};

Post.propTypes = {
	item: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		snippet: PropTypes.shape({
			title: PropTypes.string,
			publishedAt: PropTypes.string,
			thumbnails: PropTypes.shape({
				medium: PropTypes.shape({
					url: PropTypes.string,
				}),
			}),
		}),
		status: PropTypes.shape({
			privacyStatus: PropTypes.string,
		}),
		statistics: PropTypes.shape({
			viewCount: PropTypes.string,
			likeCount: PropTypes.string,
			shareCount: PropTypes.string,
		}),
	}),
	onPublish: PropTypes.func.isRequired,
	onUnpublish: PropTypes.func.isRequired,
	onDelete: PropTypes.func.isRequired,
};

export default Post;
