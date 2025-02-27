import React, { useState } from "react";
import { Card, Rate, Input, Select, Button, Avatar, List } from "antd";
import { FaStar, FaFilter, FaUser } from "react-icons/fa";

const { Option } = Select;
const { TextArea } = Input;

const FeedbackReviews = () => {
	const [filterRating, setFilterRating] = useState("All");
	const [searchTerm, setSearchTerm] = useState("");
	const [newReview, setNewReview] = useState("");
	const [newRating, setNewRating] = useState(0);
	const [reviews, setReviews] = useState([
		{
			id: 1,
			user: "Michael Scott",
			avatar: "https://randomuser.me/api/portraits/men/1.jpg",
			rating: 5,
			comment: "This platform is amazing! Highly recommended.",
			date: "2024-02-21",
		},
		{
			id: 2,
			user: "Pam Beesly",
			avatar: "https://randomuser.me/api/portraits/women/2.jpg",
			rating: 4,
			comment: "Great experience, but there's room for improvement.",
			date: "2024-02-20",
		},
		{
			id: 3,
			user: "Jim Halpert",
			avatar: "https://randomuser.me/api/portraits/men/3.jpg",
			rating: 3,
			comment: "It's decent, but I expected better customer service.",
			date: "2024-02-19",
		},
	]);

	// Handle review submission
	const handleSubmitReview = () => {
		if (newReview.trim() === "" || newRating === 0) return;

		const newFeedback = {
			id: reviews.length + 1,
			user: "New User",
			avatar: "https://randomuser.me/api/portraits/men/10.jpg",
			rating: newRating,
			comment: newReview,
			date: new Date().toISOString().split("T")[0],
		};

		setReviews([newFeedback, ...reviews]);
		setNewReview("");
		setNewRating(0);
	};

	// Filtering reviews based on search & rating
	const filteredReviews = reviews.filter(
		(review) =>
			(filterRating === "All" || review.rating === parseInt(filterRating)) &&
			review.comment.toLowerCase().includes(searchTerm.toLowerCase())
	);

	return (
		<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-6">
			{/* Header Section */}
			<div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 rounded-lg text-white text-center">
				<h2 className="text-2xl font-bold flex items-center justify-center gap-2">
					<FaStar className="text-yellow-300" /> Feedback & Reviews
				</h2>
				<p className="text-gray-200 text-sm mt-2">
					Read and share experiences from other users.
				</p>
			</div>

			{/* Write Review Section */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
				<Rate value={newRating} onChange={setNewRating} className="mb-3" />
				<TextArea
					rows={3}
					placeholder="Write your review..."
					value={newReview}
					onChange={(e) => setNewReview(e.target.value)}
				/>
				<Button
					type="primary"
					className="mt-3 bg-blue-500 text-white w-full"
					onClick={handleSubmitReview}
				>
					Submit Review
				</Button>
			</Card>

			{/* Search & Filter Section */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Search */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaUser className="text-gray-400" />
						<Input
							placeholder="Search reviews..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full bg-transparent outline-none"
						/>
					</div>

					{/* Filter */}
					<div className="flex items-center space-x-2 border rounded-md p-2 bg-gray-100">
						<FaFilter className="text-gray-400" />
						<Select
							value={filterRating}
							onChange={(value) => setFilterRating(value)}
							className="w-full"
							size="large"
						>
							<Option value="All">All Ratings</Option>
							<Option value="5">5 Stars</Option>
							<Option value="4">4 Stars</Option>
							<Option value="3">3 Stars</Option>
							<Option value="2">2 Stars</Option>
							<Option value="1">1 Star</Option>
						</Select>
					</div>
				</div>
			</Card>

			{/* Reviews List */}
			<Card className="mt-6 p-6 shadow-md rounded-lg">
				<List
					itemLayout="horizontal"
					dataSource={filteredReviews}
					renderItem={(review) => (
						<List.Item className="border-b pb-4 mb-4">
							<List.Item.Meta
								avatar={<Avatar src={review.avatar} />}
								title={
									<div className="flex items-center justify-between">
										<span className="font-semibold">{review.user}</span>
										<Rate disabled value={review.rating} />
									</div>
								}
								description={
									<div className="mt-2">
										<p>{review.comment}</p>
										<p className="text-gray-500 text-sm mt-1">
											Reviewed on {review.date}
										</p>
									</div>
								}
							/>
						</List.Item>
					)}
				/>
			</Card>
		</div>
	);
};

export default FeedbackReviews;
