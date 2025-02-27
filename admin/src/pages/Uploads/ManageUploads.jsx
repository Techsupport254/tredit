import React, { useContext } from "react";
import { Card, List, Input, Spin, Empty, Tabs } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { FaTiktok, FaFacebook, FaInstagram, FaYoutube } from "react-icons/fa";
import { UploadContext } from "../../Context/UploadContext";
import Post from "../../Components/Uploads/Post";

const { TabPane } = Tabs;

const ManageUploads = () => {
	const {
		loading,
		loadingMore,
		searchQuery,
		setSearchQuery,
		listRef,
		handleScroll,
		filteredUploads,
		activeTab,
		setActiveTab,
		unpublishVideo,
		deleteVideo,
		editVideo,
	} = useContext(UploadContext);

	return (
		<div
			className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen"
			ref={listRef}
			onScroll={handleScroll}
		>
			{/* Header */}
			<div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-8 shadow-lg">
				<div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
					<div>
						<h1 className="text-3xl font-bold text-white mb-1">
							Content Library
						</h1>
						<p className="text-blue-100">
							Manage your videos and track analytics across platforms
						</p>
					</div>
					<Input
						placeholder="Search videos..."
						prefix={<SearchOutlined className="text-blue-400" />}
						className="w-full md:w-96 rounded-full bg-white/90 backdrop-blur-sm border-none focus:shadow-lg"
						size="large"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Tabs for YouTube, TikTok, Instagram, Facebook */}
			<div className="max-w-7xl mx-auto px-0 py-4">
				<Card className="rounded-xl shadow-sm overflow-hidden p-0">
					<Tabs activeKey={activeTab} onChange={setActiveTab} centered>
						{/* YouTube Tab */}
						<TabPane
							tab={
								<span className="flex items-center gap-2">
									<FaYoutube className="text-red-500 text-lg" />
									YouTube
								</span>
							}
							key="youtube"
						>
							{loading ? (
								<div className="flex flex-col items-center justify-center py-20 space-y-4">
									<Spin
										indicator={
											<LoadingOutlined
												className="text-4xl text-indigo-600"
												spin
											/>
										}
									/>
									<span className="text-gray-500 font-medium">
										Loading YouTube videos...
									</span>
								</div>
							) : filteredUploads.length === 0 ? (
								<div className="py-20 text-center">
									<Empty description="No YouTube videos found" />
								</div>
							) : (
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
									{filteredUploads.map((item) => (
										<Post
											key={item.id}
											item={item}
											onUnpublish={unpublishVideo} // ✅ Pass unpublish function
											onDelete={deleteVideo} // ✅ Pass delete function
											onEdit={editVideo} // ✅ Pass edit function
										/>
									))}
								</div>
							)}
						</TabPane>

						{/* TikTok Tab */}
						<TabPane
							tab={
								<span className="flex items-center gap-2">
									<FaTiktok className="text-black text-lg" />
									TikTok
								</span>
							}
							key="tiktok"
						>
							<div className="py-20 text-center">
								<Empty description="TikTok integration coming soon!" />
							</div>
						</TabPane>

						{/* Instagram Tab */}
						<TabPane
							tab={
								<span className="flex items-center gap-2">
									<FaInstagram className="text-pink-500 text-lg" />
									Instagram
								</span>
							}
							key="instagram"
						>
							<div className="py-20 text-center">
								<Empty description="Instagram integration coming soon!" />
							</div>
						</TabPane>

						{/* Facebook Tab */}
						<TabPane
							tab={
								<span className="flex items-center gap-2">
									<FaFacebook className="text-blue-600 text-lg" />
									Facebook
								</span>
							}
							key="facebook"
						>
							<div className="py-20 text-center">
								<Empty description="Facebook integration coming soon!" />
							</div>
						</TabPane>
					</Tabs>
				</Card>
			</div>

			{/* Loading More Indicator */}
			{loadingMore && (
				<div className="flex justify-center py-4">
					<Spin
						indicator={
							<LoadingOutlined className="text-2xl text-indigo-600" spin />
						}
					/>
				</div>
			)}
		</div>
	);
};

export default ManageUploads;
