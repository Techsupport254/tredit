"use client";

import { Layout, Typography, Divider, Button, Input } from "antd";
import Link from "next/link";
import {
	FacebookOutlined,
	TwitterOutlined,
	InstagramOutlined,
	LinkedinOutlined,
	MailOutlined,
	PhoneOutlined,
	EnvironmentOutlined,
} from "@ant-design/icons";
import { Avatar } from "@/components/ui/avatar";

const { Content, Footer } = Layout;
const { Text, Paragraph, Title } = Typography;

export default function SlugLayout({
	children,
	business,
}: {
	children: React.ReactNode;
	business: {
		name: string;
		description: string | null;
		logo: string | null;
	};
}) {
	const logoUrl = getIpfsUrl(business?.logo);

	return (
		<Layout className="min-h-screen bg-gray-50">
			<Content>{children}</Content>

			{/* Enhanced Store Footer */}
			<Footer className="bg-white border-t border-gray-200 py-12 px-0">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
						{/* Company Info */}
						<div className="col-span-1">
							<div className="flex items-center gap-3 mb-4">
								<Avatar
									src={logoUrl}
									alt={business?.name}
									size="lg"
									className="border border-gray-200"
								/>
								<Title level={4} className="m-0">
									{business?.name}
								</Title>
							</div>
							<Paragraph className="text-gray-600 mb-4">
								{business?.description ||
									"Quality products for your everyday needs"}
							</Paragraph>

							<div className="flex gap-4">
								<Button
									shape="circle"
									icon={<FacebookOutlined />}
									className="text-gray-600 hover:text-blue-600 border-gray-200"
								/>
								<Button
									shape="circle"
									icon={<TwitterOutlined />}
									className="text-gray-600 hover:text-blue-400 border-gray-200"
								/>
								<Button
									shape="circle"
									icon={<InstagramOutlined />}
									className="text-gray-600 hover:text-pink-500 border-gray-200"
								/>
								<Button
									shape="circle"
									icon={<LinkedinOutlined />}
									className="text-gray-600 hover:text-blue-700 border-gray-200"
								/>
							</div>
						</div>

						{/* Quick Links */}
						<div>
							<Title level={5} className="mb-4 font-semibold">
								Shop
							</Title>
							<ul className="space-y-3">
								{[
									{ label: "All Products", href: "#" },
									{ label: "New Arrivals", href: "#" },
									{ label: "Featured Items", href: "#" },
									{ label: "Best Sellers", href: "#" },
									{ label: "Special Offers", href: "#" },
								].map((item) => (
									<li key={item.label}>
										<Link
											href={item.href}
											className="text-gray-600 hover:text-blue-500 transition-colors"
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Customer Service */}
						<div>
							<Title level={5} className="mb-4 font-semibold">
								Customer Service
							</Title>
							<ul className="space-y-3">
								{[
									{ label: "Contact Us", href: "#" },
									{ label: "FAQs", href: "#" },
									{ label: "Shipping Policy", href: "#" },
									{ label: "Returns & Exchanges", href: "#" },
									{ label: "Track Order", href: "#" },
								].map((item) => (
									<li key={item.label}>
										<Link
											href={item.href}
											className="text-gray-600 hover:text-blue-500 transition-colors"
										>
											{item.label}
										</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Contact Information */}
						<div>
							<Title level={5} className="mb-4 font-semibold">
								Contact Us
							</Title>
							<ul className="space-y-3">
								<li className="flex items-start gap-2">
									<MailOutlined className="text-gray-500 mt-1" />
									<span className="text-gray-600">
										support@{business?.name.toLowerCase().replace(/\s+/g, "")}
										.com
									</span>
								</li>
								<li className="flex items-start gap-2">
									<PhoneOutlined className="text-gray-500 mt-1" />
									<span className="text-gray-600">+1 (555) 123-4567</span>
								</li>
								<li className="flex items-start gap-2">
									<EnvironmentOutlined className="text-gray-500 mt-1" />
									<span className="text-gray-600">
										123 Business Ave, City, ST 12345
									</span>
								</li>
							</ul>

							<div className="mt-6">
								<Title level={5} className="mb-3 font-semibold">
									Newsletter
								</Title>
								<div className="flex">
									<Input
										placeholder="Your email"
										className="rounded-l-lg border-r-0"
									/>
									<Button
										type="primary"
										className="rounded-r-lg bg-blue-500 hover:bg-blue-600"
									>
										Subscribe
									</Button>
								</div>
							</div>
						</div>
					</div>

					<Divider className="my-8" />

					<div className="flex flex-col md:flex-row justify-between items-center gap-4">
						<Text className="text-gray-500">
							© {new Date().getFullYear()} {business?.name}. All rights
							reserved.
						</Text>

						<div className="flex gap-6">
							<Link
								href="#"
								className="text-gray-500 hover:text-blue-500 transition-colors"
							>
								Terms of Service
							</Link>
							<Link
								href="#"
								className="text-gray-500 hover:text-blue-500 transition-colors"
							>
								Privacy Policy
							</Link>
							<Link
								href="#"
								className="text-gray-500 hover:text-blue-500 transition-colors"
							>
								Cookie Policy
							</Link>
						</div>
					</div>
				</div>
			</Footer>
		</Layout>
	);
}

// Helper function to convert IPFS hash to URL
function getIpfsUrl(hash: string | null | undefined): string | null {
	if (!hash) return null;
	if (hash.startsWith("http")) return hash;
	if (hash.startsWith("ipfs://")) {
		return `${IPFS_GATEWAY}${hash.replace("ipfs://", "")}`;
	}
	return `${IPFS_GATEWAY}${hash}`;
}

const IPFS_GATEWAY =
	process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
