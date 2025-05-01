"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PaymentMethod, PaymentStatus } from "@prisma/client";
import {
	Button,
	Spin,
	Result,
	Typography,
	Space,
	Divider,
	Tag,
	Card,
	Tooltip,
	Collapse,
} from "antd";
import {
	LoadingOutlined,
	CheckCircleOutlined,
	ExclamationCircleOutlined,
	CloseCircleOutlined,
	CopyOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";
import { toast } from "sonner";
import { PaymentService } from "@/lib/services/payment.service";
import { ethers } from "ethers";
import { generateSlug, generateShareableLink } from "@/lib/utils/url";

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface PaystackPaymentSummary {
	amount: number;
	currency: string;
	paymentMethod: PaymentMethod;
	status: PaymentStatus;
	transactionHash?: string;
	paymentDate?: Date;
	metadata?: {
		buyerAddress?: string;
		sellerAddress?: string;
		cart?: {
			items: {
				product?: { name: string };
				quantity: number;
				variant?: { name: string; price: number };
			}[];
		};
	};
}

interface BlockchainPaymentSummary {
	found: boolean;
	amount?: number;
	currency?: string;
	payer?: string;
	payee?: string;
	paymentId?: string;
	isFiat?: boolean;
	isCompleted?: boolean;
	timestamp?: number;
	status?: PaymentStatus;
}

const PaymentMethodIcon = ({ method }: { method: PaymentMethod }) => {
	switch (method) {
		case "CARD":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						x="2"
						y="4"
						width="20"
						height="16"
						rx="2"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<line
						x1="2"
						y1="10"
						x2="22"
						y2="10"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<circle cx="18" cy="16" r="2" fill="currentColor" />
				</svg>
			);
		case "BANK_TRANSFER":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2L2 7L12 12L22 7L12 2Z"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
					<path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
				</svg>
			);
		case "MPESA":
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<path d="M12 6V18" stroke="currentColor" strokeWidth="2" />
					<path d="M8 10L12 6L16 10" stroke="currentColor" strokeWidth="2" />
				</svg>
			);
		default:
			return (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						x="2"
						y="4"
						width="20"
						height="16"
						rx="2"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<line
						x1="2"
						y1="10"
						x2="22"
						y2="10"
						stroke="currentColor"
						strokeWidth="2"
					/>
					<circle cx="18" cy="16" r="2" fill="currentColor" />
				</svg>
			);
	}
};

const PaymentSuccessIllustration = () => (
	<svg
		width="200"
		height="200"
		viewBox="0 0 200 200"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		{/* Background circle */}
		<circle
			cx="100"
			cy="100"
			r="80"
			fill="#E6F7FF"
			stroke="#1890FF"
			strokeWidth="4"
		/>

		{/* Shield representing security */}
		<path
			d="M100 40L140 60V90C140 120 120 140 100 160C80 140 60 120 60 90V60L100 40Z"
			fill="#1890FF"
			stroke="#1890FF"
			strokeWidth="2"
		/>

		{/* Checkmark inside shield */}
		<path
			d="M80 100L95 115L120 85"
			stroke="white"
			strokeWidth="6"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>

		{/* Small circles representing escrow */}
		<circle cx="70" cy="70" r="5" fill="#1890FF" />
		<circle cx="130" cy="70" r="5" fill="#1890FF" />
		<circle cx="100" cy="130" r="5" fill="#1890FF" />
	</svg>
);

const PaymentFailedIllustration = () => (
	<svg
		width="200"
		height="200"
		viewBox="0 0 200 200"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		{/* Background circle */}
		<circle
			cx="100"
			cy="100"
			r="80"
			fill="#FFF1F0"
			stroke="#FF4D4F"
			strokeWidth="4"
		/>

		{/* Shield with admin symbol */}
		<path
			d="M100 40L140 60V90C140 120 120 140 100 160C80 140 60 120 60 90V60L100 40Z"
			fill="#FF4D4F"
			stroke="#FF4D4F"
			strokeWidth="2"
		/>

		{/* Admin symbol (headset) */}
		<path
			d="M85 90C85 85 90 80 100 80C110 80 115 85 115 90"
			stroke="white"
			strokeWidth="4"
			strokeLinecap="round"
		/>
		<path
			d="M85 90V100C85 105 90 110 100 110C110 110 115 105 115 100V90"
			stroke="white"
			strokeWidth="4"
			strokeLinecap="round"
		/>

		{/* Support lines */}
		<path
			d="M70 80L85 90"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
		/>
		<path
			d="M130 80L115 90"
			stroke="white"
			strokeWidth="2"
			strokeLinecap="round"
		/>

		{/* Warning dots */}
		<circle cx="100" cy="130" r="3" fill="white" />
		<circle cx="90" cy="130" r="3" fill="white" />
		<circle cx="110" cy="130" r="3" fill="white" />
	</svg>
);

const PaymentPendingIllustration = () => (
	<svg
		width="200"
		height="200"
		viewBox="0 0 200 200"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		{/* Background circle */}
		<circle
			cx="100"
			cy="100"
			r="80"
			fill="#F5F5F5"
			stroke="#D9D9D9"
			strokeWidth="4"
		/>

		{/* Shield in progress */}
		<path
			d="M100 40L140 60V90C140 120 120 140 100 160C80 140 60 120 60 90V60L100 40Z"
			fill="#D9D9D9"
			stroke="#D9D9D9"
			strokeWidth="2"
		/>

		{/* Progress indicator */}
		<path
			d="M100 100L120 120"
			stroke="#D9D9D9"
			strokeWidth="6"
			strokeLinecap="round"
		/>
		<circle cx="100" cy="100" r="8" fill="#D9D9D9" />

		{/* Small circles representing escrow in progress */}
		<circle cx="70" cy="70" r="5" fill="#D9D9D9" />
		<circle cx="130" cy="70" r="5" fill="#D9D9D9" />
		<circle cx="100" cy="130" r="5" fill="#D9D9D9" />

		{/* Progress dots */}
		<circle cx="80" cy="100" r="3" fill="#D9D9D9" />
		<circle cx="100" cy="100" r="3" fill="#D9D9D9" />
		<circle cx="120" cy="100" r="3" fill="#D9D9D9" />
	</svg>
);

const CopyableText = ({ text }: { text?: string }) => {
	if (!text) return <Text type="secondary">N/A</Text>;
	return (
		<div className="flex items-center gap-2">
			<Text className="mt-1 block font-mono text-sm">{text}</Text>
			<Button
				type="text"
				icon={<CopyOutlined />}
				onClick={() => {
					navigator.clipboard.writeText(text);
					toast.success("Copied to clipboard");
				}}
			/>
		</div>
	);
};

// Utility to recursively render any object/array as a tree
function RenderObject({ data, level = 0 }: { data: any; level?: number }) {
	if (data === null || data === undefined)
		return <span style={{ color: "#888" }}>null</span>;
	if (
		typeof data === "string" ||
		typeof data === "number" ||
		typeof data === "boolean"
	) {
		return <span>{String(data)}</span>;
	}
	if (Array.isArray(data)) {
		return (
			<ul style={{ marginLeft: level * 16 }}>
				{data.map((item: any, idx: number) => (
					<li key={idx}>
						<RenderObject data={item} level={level + 1} />
					</li>
				))}
			</ul>
		);
	}
	if (typeof data === "object") {
		return (
			<ul style={{ marginLeft: level * 16 }}>
				{Object.entries(data).map(([key, value]) => (
					<li key={key}>
						<strong>{key}:</strong>{" "}
						<RenderObject data={value} level={level + 1} />
					</li>
				))}
			</ul>
		);
	}
	return <span>{String(data)}</span>;
}

// Utility: format currency
function formatCurrency(amount: number, currency: string = "KES") {
	return amount?.toLocaleString("en-US", {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
}

// Utility: format date
function formatDate(date: string | Date | undefined | null) {
	if (!date) return "N/A";
	const d = typeof date === "string" ? new Date(date) : date;
	if (isNaN(d.getTime())) return "N/A";
	return d.toLocaleString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZoneName: "short",
	});
}

// Modern Payment Details Card
function PaymentDetailsCard({
	payment,
	metadata,
}: {
	payment: any;
	metadata: any;
}) {
	if (!payment) return null;
	const cart = metadata?.cart || metadata?.cart || payment?.cart;
	const business = payment?.business || metadata?.business;
	const customer = payment?.customer || metadata?.customer;
	const shippingAddress = payment?.shippingAddress || metadata?.shippingAddress;
	const shippingMethod = payment?.shippingMethod || metadata?.shippingMethod;
	const shippingFee = payment?.shippingFee || metadata?.shippingFee;
	const orderId =
		payment?.orderId ||
		metadata?.orderId ||
		payment?.custom_fields?.find?.((f: any) => f.variable_name === "orderId")
			?.value;
	const paymentMethod =
		payment?.paymentMethod || metadata?.paymentMethod || payment?.channel;
	const status =
		payment?.status || payment?.payment_status || payment?.currentStatus;
	const reference =
		payment?.reference || payment?.paystackRef || payment?.paystackref;
	const amount =
		payment?.amount ||
		payment?.totalAmount ||
		payment?.total ||
		payment?.requested_amount;
	const currency = payment?.currency || "KES";
	const paymentDate =
		payment?.paymentDate ||
		payment?.paid_at ||
		payment?.paidAt ||
		payment?.createdAt;

	return (
		<Card
			title={
				<span className="flex items-center gap-2">
					<CheckCircleOutlined className="text-green-500" /> Payment Details
				</span>
			}
			className="mb-8 mt-8 shadow-lg border-0"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Payment Summary */}
				<div className="space-y-4">
					<div>
						<Text type="secondary">Status</Text>
						<div className="mt-1">
							<Tag
								color={
									status === "PAID"
										? "success"
										: status === "PENDING"
										? "processing"
										: "error"
								}
							>
								{status}
							</Tag>
						</div>
					</div>
					<div>
						<Text type="secondary">Reference</Text>
						<CopyableText text={reference} />
					</div>
					<div>
						<Text type="secondary">Payment Method</Text>
						<Text className="block mt-1">{paymentMethod || "N/A"}</Text>
					</div>
					<div>
						<Text type="secondary">Payment Date</Text>
						<Text className="block mt-1">{formatDate(paymentDate)}</Text>
					</div>
					<div>
						<Text type="secondary">Amount</Text>
						<Text strong className="block mt-1 text-lg">
							{amount ? formatCurrency(Number(amount), currency) : "N/A"}
						</Text>
					</div>
				</div>
				{/* Order, Business, Customer, Shipping */}
				<div className="space-y-4">
					{orderId && (
						<div>
							<Text type="secondary">Order ID</Text>
							<CopyableText text={orderId} />
						</div>
					)}
					{business && (
						<div>
							<Text type="secondary">Business</Text>
							<div className="mt-1">
								<Text strong>{business?.name}</Text>
								{business?.type && (
									<Text type="secondary" className="ml-2">
										({business?.type})
									</Text>
								)}
							</div>
						</div>
					)}
					{customer && (
						<div>
							<Text type="secondary">Customer</Text>
							<div className="mt-1">
								<Text>{customer?.email}</Text>
								{customer?.phone && (
									<Text className="ml-2">{customer?.phone}</Text>
								)}
							</div>
						</div>
					)}
					{shippingAddress && (
						<div>
							<Text type="secondary">Shipping Address</Text>
							<Text className="block mt-1">{shippingAddress}</Text>
						</div>
					)}
					{shippingMethod && (
						<div>
							<Text type="secondary">Shipping Method</Text>
							<Text className="block mt-1">{shippingMethod}</Text>
						</div>
					)}
					{shippingFee && (
						<div>
							<Text type="secondary">Shipping Fee</Text>
							<Text className="block mt-1">
								{formatCurrency(Number(shippingFee), currency)}
							</Text>
						</div>
					)}
				</div>
			</div>
			{/* Cart Items */}
			{cart?.items?.length > 0 && (
				<div className="mt-8">
					<Divider orientation="left">Cart Items</Divider>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{cart.items.map((item: any, idx: number) => {
							const product = item.product || item;
							const variant = item.variant;
							const image =
								product?.media?.[0]?.url ||
								product?.media?.url ||
								product?.media?.[0] ||
								product?.media;
							return (
								<Card
									key={idx}
									bordered={false}
									className="bg-gray-50 shadow-sm"
								>
									{image && (
										<img
											src={image}
											alt={product?.name}
											className="w-full h-32 object-cover rounded mb-2"
										/>
									)}
									<div className="font-semibold text-base mb-1">
										{product?.name}
									</div>
									{variant && (
										<div className="text-xs text-gray-500 mb-1">
											Variant: {variant?.name} (
											{formatCurrency(Number(variant?.price), currency)})
										</div>
									)}
									<div className="text-xs text-gray-500 mb-1">
										Quantity: {item?.quantity || 1}
									</div>
									<div className="text-xs text-gray-500">
										Price: {formatCurrency(Number(item?.price), currency)}
									</div>
								</Card>
							);
						})}
					</div>
				</div>
			)}
		</Card>
	);
}

export default function PaymentVerificationPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const { data: session } = useSession();
	const [isVerifying, setIsVerifying] = useState(true);
	const [paystackSummary, setPaystackSummary] =
		useState<PaystackPaymentSummary | null>(null);
	const [blockchainSummary, setBlockchainSummary] =
		useState<BlockchainPaymentSummary | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [debugApiResponse, setDebugApiResponse] = useState<any>(null);
	const [escrowSummary, setEscrowSummary] = useState<any>(null);
	const [storeSlug, setStoreSlug] = useState<string | null>(null);

	// Extract store slug from metadata
	useEffect(() => {
		if (debugApiResponse?.steps) {
			const paymentStep = debugApiResponse.steps.find((s: any) => s.payment);
			const businessId = paymentStep?.payment?.metadata?.businessId;
			const businessName = paymentStep?.payment?.business?.name;

			console.log("[DEBUG] Payment step:", paymentStep);
			console.log("[DEBUG] Business ID:", businessId);
			console.log("[DEBUG] Business name:", businessName);

			if (businessId && businessName) {
				const slug = generateSlug(businessName);
				const fullSlug = `${slug}-${businessId}`;
				console.log("[DEBUG] Setting store slug:", fullSlug);
				setStoreSlug(fullSlug);
			}
		}
	}, [debugApiResponse]);

	// Add debug logging for all payment and blockchain data
	useEffect(() => {
		if (paystackSummary) {
			console.log(
				"[DEBUG] Paystack Summary (Off-chain Payment):",
				paystackSummary
			);
		}
		if (blockchainSummary) {
			console.log(
				"[DEBUG] Blockchain Summary (On-chain Payment):",
				blockchainSummary
			);
		}
	}, [paystackSummary, blockchainSummary]);

	// Extract payment and escrow from debugApiResponse
	useEffect(() => {
		if (debugApiResponse?.steps) {
			// Find payment and escrow steps
			const paymentStep = debugApiResponse.steps.find((s: any) => s.payment);
			const escrowStep = debugApiResponse.steps.find((s: any) => s.escrow);
			setPaystackSummary(paymentStep?.payment || null);
			setEscrowSummary(escrowStep?.escrow || null);
		}
		// eslint-disable-next-line
	}, [debugApiResponse]);

	// Add logging for API responses
	const verifyPaymentBackend = async (reference: string) => {
		const res = await fetch(`/api/paystack/verify?reference=${reference}`);
		const data = await res.json();
		console.log("[DEBUG] API /api/paystack/verify response:", data);
		setDebugApiResponse(data); // Save for debug display
		if (!res.ok) throw new Error(data.error || "Failed to verify payment");
		return data;
	};

	const verifyPaymentStatus = async () => {
		try {
			setIsVerifying(true);
			setError(null);
			const reference = searchParams.get("reference");
			if (!reference) throw new Error("No payment reference found");

			const verificationResult = await verifyPaymentBackend(reference);
			const paystackData = verificationResult.data || verificationResult;
			console.log("[DEBUG] paystackData:", paystackData);
			if (!paystackData.status) throw new Error("Payment verification failed");

			// Extract business information from metadata
			const businessId = paystackData.metadata?.businessId;
			const businessName = paystackData.metadata?.business?.name;

			console.log("[DEBUG] Business ID from payment:", businessId);
			console.log("[DEBUG] Business name from payment:", businessName);

			if (businessId && businessName) {
				const slug = generateSlug(businessName);
				const fullSlug = `${slug}-${businessId}`;
				console.log("[DEBUG] Setting store slug from payment:", fullSlug);
				setStoreSlug(fullSlug);
			}

			setPaystackSummary({
				amount: paystackData.amount ? paystackData.amount / 100 : 0, // Convert from kobo to naira
				currency: paystackData.currency || "KES",
				paymentMethod: (paystackData.channel === "bank"
					? "BANK_TRANSFER"
					: paystackData.channel === "mobile_money"
					? "MPESA"
					: "CARD") as PaymentMethod,
				status: paystackData.status === "success" ? "PAID" : "PENDING",
				transactionHash: paystackData.reference,
				paymentDate: paystackData.paid_at
					? new Date(paystackData.paid_at)
					: new Date(),
				metadata: {
					buyerAddress: paystackData.metadata?.buyerAddress,
					sellerAddress: paystackData.metadata?.sellerAddress,
					cart: paystackData.metadata?.cart,
				},
			});

			try {
				const paymentService = await PaymentService.getInstance();
				const refBytes32 = ethers.encodeBytes32String(reference);
				const paymentStatus = await paymentService.getPaymentStatus(refBytes32);
				console.log("[DEBUG] Blockchain paymentStatus:", paymentStatus);

				const isEmptyPayment =
					!paymentStatus ||
					(paymentStatus.payer === ethers.ZeroAddress &&
						paymentStatus.amount === BigInt(0));

				if (isEmptyPayment) {
					setBlockchainSummary({ found: false });
				} else {
					setBlockchainSummary({
						found: true,
						amount: Number(paymentStatus.amount),
						currency: "KES",
						payer: paymentStatus.payer,
						payee: paymentStatus.payee,
						paymentId: paymentStatus.paymentId,
						isFiat: paymentStatus.isFiat,
						isCompleted: paymentStatus.isCompleted,
						timestamp: Number(paymentStatus.timestamp),
						status: paymentStatus.isCompleted ? "PAID" : "PENDING",
					});
					console.log("[DEBUG] Blockchain summary set:", {
						found: true,
						amount: Number(paymentStatus.amount),
						currency: "KES",
						payer: paymentStatus.payer,
						payee: paymentStatus.payee,
						paymentId: paymentStatus.paymentId,
						isFiat: paymentStatus.isFiat,
						isCompleted: paymentStatus.isCompleted,
						timestamp: Number(paymentStatus.timestamp),
						status: paymentStatus.isCompleted ? "PAID" : "PENDING",
					});
				}
			} catch (blockchainError) {
				console.error(
					"[DEBUG] Blockchain payment verification error:",
					blockchainError
				);
				setBlockchainSummary({ found: false });
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to verify payment");
			toast.error("Payment verification failed");
			console.error("[DEBUG] Payment verification error:", err);
		} finally {
			setIsVerifying(false);
		}
	};

	useEffect(() => {
		verifyPaymentStatus();
	}, [searchParams]);

	if (isVerifying) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
				<Space direction="vertical" align="center" size="large">
					<Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
					<Title level={3} className="text-gray-700">
						Verifying Payment
					</Title>
					<Text type="secondary" className="text-gray-500">
						Please wait while we confirm your payment...
					</Text>
				</Space>
			</div>
		);
	}

	if (error) {
		// Extract reference or trxref from URL
		const reference =
			searchParams.get("reference") || searchParams.get("trxref");
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-12 px-4">
					<div className="flex flex-col items-center w-full">
						<div className="mb-8 flex justify-center">
							<PaymentFailedIllustration />
						</div>
						<h2 className="text-2xl font-semibold text-gray-900 mb-2 text-center">
							Verification Failed
						</h2>
						<p className="text-gray-500 mb-8 text-center">{error}</p>
						<div className="flex flex-row gap-4 justify-center w-full mb-6">
							<Button
								type="primary"
								danger
								size="large"
								onClick={verifyPaymentStatus}
							>
								Try Again
							</Button>
							<Button
								type="default"
								size="large"
								onClick={() => router.push("/support/payment" as any)}
							>
								Contact Payment Admins
							</Button>
						</div>
						<div className="bg-gray-100 rounded p-4 w-full text-center">
							<p className="text-gray-700 text-sm mb-2">
								<span className="font-semibold">Tip:</span> When contacting
								payment admins, please mention your transaction reference below
								so we can assist you faster.
							</p>
							{reference && (
								<div className="flex flex-col items-center">
									<span className="text-xs text-gray-500 mb-1">Reference:</span>
									<code className="bg-white px-2 py-1 rounded text-red-600 font-mono text-sm border border-gray-200">
										{reference}
									</code>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (!paystackSummary) {
		return null;
	}

	// Find payment and escrow steps from debugApiResponse
	const paymentStep = debugApiResponse?.steps?.find((s: any) => s.payment);
	const escrowStep = debugApiResponse?.steps?.find((s: any) => s.escrow);
	const paystackApiStep = debugApiResponse?.steps?.find(
		(s: any) => s.body && s.body.data
	);
	const paymentMetadata = paymentStep?.payment?.metadata;

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header Section */}
				<div className="text-center mb-12">
					<Title level={2} className="text-gray-800 font-bold tracking-tight">
						Payment Verification Summary
					</Title>
					<Text type="secondary" className="text-gray-500">
						Your payment has been successfully processed
					</Text>
				</div>

				{/* Main Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* Paystack Payment Card */}
					<Card
						title={
							<span className="flex items-center gap-2 text-lg font-semibold">
								<img
									src="/paystack-logo.svg"
									alt="Paystack"
									className="w-6 h-6"
								/>
								Paystack Payment
							</span>
						}
						className="bg-white border-0 shadow-lg rounded-xl"
						styles={{ body: { padding: 24 } }}
					>
						<Space direction="vertical" size="large" style={{ width: "100%" }}>
							{/* Payment Method and Date */}
							<div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
								<Space>
									<PaymentMethodIcon method={paystackSummary.paymentMethod} />
									<Text strong className="text-lg">
										{paystackSummary.paymentMethod}
									</Text>
								</Space>
								<Text type="secondary">
									{formatDate(paystackSummary.paymentDate)}
								</Text>
							</div>

							{/* Status and Reference */}
							<div className="grid grid-cols-2 gap-6">
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Status
									</Text>
									<Tag
										color={
											paystackSummary.status === "PAID"
												? "success"
												: paystackSummary.status === "PENDING"
												? "processing"
												: "error"
										}
										className="text-base px-3 py-1"
									>
										{paystackSummary.status}
									</Tag>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Reference
									</Text>
									<CopyableText text={paystackSummary.transactionHash} />
								</div>
							</div>

							{/* Amount Section */}
							<div className="bg-green-50 p-6 rounded-lg">
								<Text type="secondary" className="block mb-2">
									Total Amount
								</Text>
								<Text strong className="text-3xl text-green-700">
									{formatCurrency(
										paystackSummary.amount,
										paystackSummary.currency
									)}
								</Text>
							</div>
						</Space>
					</Card>

					{/* Blockchain Payment Card */}
					<Card
						title={
							<span className="flex items-center gap-2 text-lg font-semibold">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-emerald-600"
								>
									{/* Outer circle */}
									<circle
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="2"
										strokeDasharray="2 2"
									/>
									{/* Inner hexagon */}
									<path
										d="M12 4L18 8V16L12 20L6 16V8L12 4Z"
										stroke="currentColor"
										strokeWidth="2"
										fill="none"
									/>
									{/* Connecting lines */}
									<path
										d="M12 4V20"
										stroke="currentColor"
										strokeWidth="2"
										strokeDasharray="1 1"
									/>
									<path
										d="M6 8H18"
										stroke="currentColor"
										strokeWidth="2"
										strokeDasharray="1 1"
									/>
									<path
										d="M6 16H18"
										stroke="currentColor"
										strokeWidth="2"
										strokeDasharray="1 1"
									/>
									{/* Center dot */}
									<circle cx="12" cy="12" r="2" fill="currentColor" />
								</svg>
								<span className="text-emerald-600">Blockchain Payment</span>
							</span>
						}
						className="bg-white border-0 shadow-lg rounded-xl"
						styles={{ body: { padding: 24 } }}
					>
						{blockchainSummary && blockchainSummary.found ? (
							<Space
								direction="vertical"
								size="large"
								style={{ width: "100%" }}
							>
								{/* Status Banner */}
								<div className="bg-emerald-50 rounded-lg p-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div
												className={`w-4 h-4 rounded-full ${
													blockchainSummary.status === "PAID"
														? "bg-green-500"
														: blockchainSummary.status === "PENDING"
														? "bg-yellow-500"
														: "bg-red-500"
												}`}
											/>
											<Text strong className="text-xl text-emerald-700">
												{blockchainSummary.status}
											</Text>
										</div>
										<Tag
											color={
												blockchainSummary.status === "PAID"
													? "success"
													: blockchainSummary.status === "PENDING"
													? "processing"
													: "error"
											}
											className="text-base px-3 py-1"
										>
											{blockchainSummary.isFiat
												? "Fiat Payment"
												: "Crypto Payment"}
										</Tag>
									</div>
								</div>

								{/* Payment Details Grid */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Amount and Timestamp */}
									<div className="space-y-6">
										<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
											<Text type="secondary" className="block mb-2">
												Total Amount
											</Text>
											<Text strong className="text-2xl text-emerald-700">
												{formatCurrency(
													blockchainSummary.amount,
													blockchainSummary.currency
												)}
											</Text>
										</div>

										<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
											<Text type="secondary" className="block mb-2">
												Transaction Time
											</Text>
											<Text className="text-sm">
												{formatDate(
													blockchainSummary.timestamp
														? new Date(blockchainSummary.timestamp * 1000)
														: undefined
												)}
											</Text>
										</div>
									</div>

									{/* Payment ID and Escrow Status */}
									<div className="space-y-6">
										<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
											<Tooltip title="On-chain Payment ID">
												<Text type="secondary" className="block mb-2">
													Payment ID{" "}
													<InfoCircleOutlined className="ml-1 text-gray-400" />
												</Text>
											</Tooltip>
											<CopyableText text={blockchainSummary.paymentId} />
										</div>

										<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
											<Text type="secondary" className="block mb-2">
												Escrow Status
											</Text>
											<div className="flex items-center gap-2">
												<div
													className={`w-2 h-2 rounded-full ${
														blockchainSummary.isCompleted
															? "bg-green-500"
															: "bg-yellow-500"
													}`}
												/>
												<Text>
													{blockchainSummary.isCompleted
														? "Released"
														: "Held in Escrow"}
												</Text>
											</div>
										</div>
									</div>
								</div>

								{/* Addresses Section */}
								<div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<Tooltip title="Payer address on blockchain">
												<Text type="secondary" className="block mb-2">
													Payer Address{" "}
													<InfoCircleOutlined className="ml-1 text-gray-400" />
												</Text>
											</Tooltip>
											<CopyableText text={blockchainSummary.payer} />
										</div>
										<div>
											<Tooltip title="Payee address on blockchain">
												<Text type="secondary" className="block mb-2">
													Payee Address{" "}
													<InfoCircleOutlined className="ml-1 text-gray-400" />
												</Text>
											</Tooltip>
											<CopyableText text={blockchainSummary.payee} />
										</div>
									</div>
								</div>
							</Space>
						) : (
							<div className="flex flex-col items-center justify-center h-full min-h-[200px] bg-emerald-50 rounded-lg p-8">
								<div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
									<InfoCircleOutlined
										style={{ color: "#10B981", fontSize: 32 }}
									/>
								</div>
								<Text className="text-center text-gray-600 mb-2 text-lg">
									No blockchain payment found
								</Text>
								<Text className="text-center text-sm text-gray-500">
									This payment was processed off-chain via Paystack and is not
									yet on the blockchain.
								</Text>
							</div>
						)}
					</Card>
				</div>

				{/* Order Details Section */}
				{paymentStep?.payment && (
					<div className="mb-8">
						<PaymentDetailsCard
							payment={paymentStep.payment}
							metadata={paymentMetadata}
						/>
					</div>
				)}

				{/* Escrow Records Section */}
				{escrowStep?.escrow && (
					<Card
						title={
							<span className="flex items-center gap-2 text-lg font-semibold">
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									className="text-blue-600"
								>
									<path
										d="M12 2L2 7L12 12L22 7L12 2Z"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<path
										d="M2 17L12 22L22 17"
										stroke="currentColor"
										strokeWidth="2"
									/>
									<path
										d="M2 12L12 17L22 12"
										stroke="currentColor"
										strokeWidth="2"
									/>
								</svg>
								Escrow Records
							</span>
						}
						className="bg-white border-0 shadow-lg rounded-xl mb-8"
					>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="space-y-4">
								<div className="bg-blue-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Escrow ID
									</Text>
									<CopyableText text={escrowStep.escrow.id} />
								</div>
								<div className="bg-blue-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Status
									</Text>
									<Tag
										color={
											escrowStep.escrow.status === "ACTIVE"
												? "processing"
												: escrowStep.escrow.status === "RELEASED"
												? "success"
												: "error"
										}
										className="text-base px-3 py-1"
									>
										{escrowStep.escrow.status}
									</Tag>
								</div>
							</div>
							<div className="space-y-4">
								<div className="bg-blue-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Amount
									</Text>
									<Text strong className="text-xl text-blue-700">
										{formatCurrency(
											escrowStep.escrow.amount,
											escrowStep.escrow.currency
										)}
									</Text>
								</div>
								<div className="bg-blue-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Created At
									</Text>
									<Text>{formatDate(escrowStep.escrow.createdAt)}</Text>
								</div>
							</div>
						</div>
						<Divider />
						<div className="mt-4">
							<Text strong className="block mb-4">
								Release Conditions
							</Text>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Dispute Period
									</Text>
									<Text>
										{escrowStep.escrow.releaseConditions.disputePeriod} days
									</Text>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Auto Release After
									</Text>
									<Text>
										{escrowStep.escrow.releaseConditions.autoReleaseAfter} days
									</Text>
								</div>
								<div className="bg-gray-50 p-4 rounded-lg">
									<Text type="secondary" className="block mb-2">
										Delivery Confirmed
									</Text>
									<Tag
										color={
											escrowStep.escrow.releaseConditions.deliveryConfirmed
												? "success"
												: "warning"
										}
									>
										{escrowStep.escrow.releaseConditions.deliveryConfirmed
											? "Yes"
											: "No"}
									</Tag>
								</div>
							</div>
						</div>
					</Card>
				)}

				{/* Action Buttons */}
				<div className="flex justify-center space-x-4 pt-8">
					<Button
						type="primary"
						size="large"
						className="bg-blue-600 hover:bg-blue-700 border-none px-8 h-12 text-base"
						onClick={() => {
							if (storeSlug) {
								const targetUrl = `/${storeSlug}`;
								console.log("[DEBUG] Redirecting to:", targetUrl);
								window.location.href = targetUrl;
							} else {
								console.log(
									"[DEBUG] No store slug available, redirecting to home"
								);
								console.log("[DEBUG] Current store slug state:", storeSlug);
								window.location.href = "/";
							}
						}}
					>
						View Orders
					</Button>
					<Button
						type="default"
						size="large"
						className="px-8 h-12 text-base"
						onClick={() => router.push("/support/payment" as any)}
					>
						Contact Support
					</Button>
				</div>

				{/* Debug Section */}
				<Collapse className="mt-8">
					<Panel header="Debug Data (Dev Only)" key="1">
						<div className="space-y-4">
							<div>
								<Text strong>Raw API Response:</Text>
								<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mt-2">
									{JSON.stringify(debugApiResponse, null, 2)}
								</pre>
							</div>
							<div>
								<Text strong>Paystack Summary:</Text>
								<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mt-2">
									{JSON.stringify(paystackSummary, null, 2)}
								</pre>
							</div>
							<div>
								<Text strong>Blockchain Summary:</Text>
								<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mt-2">
									{JSON.stringify(blockchainSummary, null, 2)}
								</pre>
							</div>
							{debugApiResponse?.escrow && (
								<div>
									<Text strong>Escrow Data:</Text>
									<pre className="bg-gray-100 rounded p-4 text-xs overflow-x-auto mt-2">
										{JSON.stringify(debugApiResponse.escrow, null, 2)}
									</pre>
								</div>
							)}
						</div>
					</Panel>
				</Collapse>
			</div>
		</div>
	);
}
