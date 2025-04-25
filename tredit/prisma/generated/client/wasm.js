
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  walletAddress: 'walletAddress',
  acceptBlockchainStorage: 'acceptBlockchainStorage',
  status: 'status',
  role: 'role',
  verificationStatus: 'verificationStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  lastLogin: 'lastLogin',
  blockchainTxHash: 'blockchainTxHash',
  ipfsUrl: 'ipfsUrl',
  ipfsMetadata: 'ipfsMetadata',
  profileImage: 'profileImage',
  gender: 'gender',
  dob: 'dob',
  phoneNumber: 'phoneNumber',
  bio: 'bio',
  preferences: 'preferences',
  metadata: 'metadata',
  lastNotificationAt: 'lastNotificationAt',
  unreadCount: 'unreadCount',
  shippingAddress: 'shippingAddress'
};

exports.Prisma.BusinessScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  bio: 'bio',
  type: 'type',
  category: 'category',
  status: 'status',
  verificationStatus: 'verificationStatus',
  email: 'email',
  phone: 'phone',
  address: 'address',
  logo: 'logo',
  coverImage: 'coverImage',
  images: 'images',
  currency: 'currency',
  revenue: 'revenue',
  blockchainTxHash: 'blockchainTxHash',
  ipfsUrl: 'ipfsUrl',
  ipfsMetadata: 'ipfsMetadata',
  averageRating: 'averageRating',
  reviewCount: 'reviewCount',
  documents: 'documents',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  acceptedCurrencies: 'acceptedCurrencies',
  alternativePhone: 'alternativePhone',
  certifications: 'certifications',
  city: 'city',
  coordinates: 'coordinates',
  country: 'country',
  employeeCount: 'employeeCount',
  insuranceInfo: 'insuranceInfo',
  languages: 'languages',
  licenseNumber: 'licenseNumber',
  postalCode: 'postalCode',
  privacyPolicy: 'privacyPolicy',
  registrationNumber: 'registrationNumber',
  returnPolicy: 'returnPolicy',
  serviceAreas: 'serviceAreas',
  shippingPolicy: 'shippingPolicy',
  sla: 'sla',
  subcategories: 'subcategories',
  supportEmail: 'supportEmail',
  supportPhone: 'supportPhone',
  tags: 'tags',
  taxId: 'taxId',
  teamRoles: 'teamRoles',
  termsOfService: 'termsOfService',
  timezone: 'timezone',
  businessModel: 'businessModel',
  operationMode: 'operationMode',
  paymentMethods: 'paymentMethods'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  description: 'description',
  price: 'price',
  stock: 'stock',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  ipfsHash: 'ipfsHash'
};

exports.Prisma.ProductMediaScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  type: 'type',
  url: 'url',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  description: 'description',
  price: 'price',
  duration: 'duration',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  businessId: 'businessId',
  status: 'status',
  totalAmount: 'totalAmount',
  paymentStatus: 'paymentStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  serviceId: 'serviceId',
  quantity: 'quantity',
  price: 'price',
  createdAt: 'createdAt'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  shippingAddress: 'shippingAddress'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  serviceId: 'serviceId',
  quantity: 'quantity',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  variantId: 'variantId'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  status: 'status',
  createdAt: 'createdAt',
  chatSessionId: 'chatSessionId',
  conversationId: 'conversationId',
  deletedAt: 'deletedAt',
  direction: 'direction',
  editedAt: 'editedAt',
  encryption: 'encryption',
  forwardedFrom: 'forwardedFrom',
  metadata: 'metadata',
  replyTo: 'replyTo',
  type: 'type',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageAttachmentScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  type: 'type',
  url: 'url',
  filename: 'filename',
  size: 'size',
  width: 'width',
  height: 'height',
  duration: 'duration',
  thumbnail: 'thumbnail',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageReactionScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  userId: 'userId',
  emoji: 'emoji',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageReadScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  userId: 'userId',
  readAt: 'readAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  description: 'description',
  avatar: 'avatar',
  isArchived: 'isArchived',
  isMuted: 'isMuted',
  lastMessageId: 'lastMessageId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationParticipantScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt',
  leftAt: 'leftAt',
  isMuted: 'isMuted',
  lastReadAt: 'lastReadAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  type: 'type',
  status: 'status',
  initiatorId: 'initiatorId',
  startTime: 'startTime',
  endTime: 'endTime',
  duration: 'duration',
  recordingUrl: 'recordingUrl',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CallParticipantScalarFieldEnum = {
  id: 'id',
  callId: 'callId',
  userId: 'userId',
  status: 'status',
  joinTime: 'joinTime',
  leaveTime: 'leaveTime',
  duration: 'duration',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DisputeScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  userId: 'userId',
  status: 'status',
  reason: 'reason',
  resolution: 'resolution',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessTeamMemberScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  role: 'role',
  createdAt: 'createdAt',
  responsibilities: 'responsibilities',
  updatedAt: 'updatedAt',
  permissions: 'permissions'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  name: 'name',
  value: 'value',
  price: 'price',
  stock: 'stock',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductAnalyticsScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  views: 'views',
  purchases: 'purchases',
  revenue: 'revenue',
  lastUpdated: 'lastUpdated'
};

exports.Prisma.ProductSEOScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  title: 'title',
  description: 'description',
  keywords: 'keywords',
  lastUpdated: 'lastUpdated'
};

exports.Prisma.SocialMediaContentScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  platform: 'platform',
  content: 'content',
  status: 'status',
  scheduledAt: 'scheduledAt',
  postedAt: 'postedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  businessId: 'businessId',
  status: 'status',
  createdAt: 'createdAt',
  lastMessageAt: 'lastMessageAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WhatsAppScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  phoneNumber: 'phoneNumber',
  status: 'status',
  apiKey: 'apiKey',
  lastSync: 'lastSync',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RatingScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  rating: 'rating',
  review: 'review',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessVerificationScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  type: 'type',
  status: 'status',
  documentUrl: 'documentUrl',
  verifiedAt: 'verifiedAt',
  expiresAt: 'expiresAt',
  verifierNotes: 'verifierNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessSubscriptionScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  tier: 'tier',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  billingCycle: 'billingCycle',
  amount: 'amount',
  features: 'features',
  paymentMethod: 'paymentMethod',
  autoRenew: 'autoRenew',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessHoursScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  dayOfWeek: 'dayOfWeek',
  openTime: 'openTime',
  closeTime: 'closeTime',
  breakStart: 'breakStart',
  breakEnd: 'breakEnd',
  isClosed: 'isClosed',
  isHoliday: 'isHoliday',
  holidayName: 'holidayName',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceCategoryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  description: 'description',
  type: 'type',
  basePrice: 'basePrice',
  duration: 'duration',
  isAvailable: 'isAvailable',
  requiresApproval: 'requiresApproval',
  prerequisites: 'prerequisites',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  digitalServiceType: 'digitalServiceType',
  isDigital: 'isDigital',
  requiresEscrow: 'requiresEscrow',
  minPaymentPercent: 'minPaymentPercent',
  paymentModels: 'paymentModels',
  estimatedDuration: 'estimatedDuration',
  complexity: 'complexity',
  deliverables: 'deliverables'
};

exports.Prisma.ProductCategoryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  description: 'description',
  type: 'type',
  basePrice: 'basePrice',
  stockLevel: 'stockLevel',
  reorderPoint: 'reorderPoint',
  reorderQuantity: 'reorderQuantity',
  isAvailable: 'isAvailable',
  requiresApproval: 'requiresApproval',
  specifications: 'specifications',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceScheduleScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  serviceCategoryId: 'serviceCategoryId',
  startTime: 'startTime',
  endTime: 'endTime',
  isAvailable: 'isAvailable',
  maxBookings: 'maxBookings',
  currentBookings: 'currentBookings',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InventoryScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  productCategoryId: 'productCategoryId',
  quantity: 'quantity',
  location: 'location',
  lastRestocked: 'lastRestocked',
  nextRestock: 'nextRestock',
  minimumQuantity: 'minimumQuantity',
  maximumQuantity: 'maximumQuantity',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceProviderScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  userId: 'userId',
  serviceTypes: 'serviceTypes',
  isAvailable: 'isAvailable',
  rating: 'rating',
  experience: 'experience',
  certifications: 'certifications',
  schedule: 'schedule',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SupplierScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  name: 'name',
  contactPerson: 'contactPerson',
  email: 'email',
  phone: 'phone',
  address: 'address',
  products: 'products',
  leadTime: 'leadTime',
  paymentTerms: 'paymentTerms',
  rating: 'rating',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceAgreementScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  clientId: 'clientId',
  serviceCategoryId: 'serviceCategoryId',
  title: 'title',
  description: 'description',
  startDate: 'startDate',
  endDate: 'endDate',
  paymentModel: 'paymentModel',
  paymentFrequency: 'paymentFrequency',
  totalAmount: 'totalAmount',
  currency: 'currency',
  status: 'status',
  terms: 'terms',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DeliverableScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  title: 'title',
  description: 'description',
  dueDate: 'dueDate',
  amount: 'amount',
  status: 'status',
  completionDate: 'completionDate',
  approvalDate: 'approvalDate',
  feedback: 'feedback',
  revisions: 'revisions',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EscrowScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  releaseConditions: 'releaseConditions',
  releaseDate: 'releaseDate',
  disputeReason: 'disputeReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  amount: 'amount',
  currency: 'currency',
  paymentMethod: 'paymentMethod',
  status: 'status',
  transactionHash: 'transactionHash',
  paymentDate: 'paymentDate',
  dueDate: 'dueDate',
  isRecurring: 'isRecurring',
  frequency: 'frequency',
  nextPaymentDate: 'nextPaymentDate',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ServiceReviewScalarFieldEnum = {
  id: 'id',
  agreementId: 'agreementId',
  rating: 'rating',
  comment: 'comment',
  isPublic: 'isPublic',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  type: 'type',
  priority: 'priority',
  status: 'status',
  title: 'title',
  data: 'data',
  channels: 'channels',
  recipientId: 'recipientId',
  senderId: 'senderId',
  businessId: 'businessId',
  agreementId: 'agreementId',
  deliverableId: 'deliverableId',
  paymentId: 'paymentId',
  escrowId: 'escrowId',
  disputeId: 'disputeId',
  orderId: 'orderId',
  productId: 'productId',
  serviceId: 'serviceId',
  scheduledAt: 'scheduledAt',
  sentAt: 'sentAt',
  deliveredAt: 'deliveredAt',
  readAt: 'readAt',
  expiresAt: 'expiresAt',
  retryCount: 'retryCount',
  lastRetryAt: 'lastRetryAt',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  groupId: 'groupId',
  isInteractive: 'isInteractive',
  isGrouped: 'isGrouped',
  isSilent: 'isSilent',
  isPersistent: 'isPersistent',
  badgeCount: 'badgeCount',
  deepLink: 'deepLink',
  category: 'category',
  tags: 'tags',
  customData: 'customData',
  archivedAt: 'archivedAt',
  deletedAt: 'deletedAt'
};

exports.Prisma.NotificationPreferenceScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  channel: 'channel',
  isEnabled: 'isEnabled',
  frequency: 'frequency',
  quietHours: 'quietHours',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationTemplateScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  message: 'message',
  variables: 'variables',
  defaultChannels: 'defaultChannels',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  category: 'category',
  version: 'version',
  language: 'language',
  isDefault: 'isDefault',
  metadata: 'metadata',
  preview: 'preview',
  validationRules: 'validationRules',
  fallbackTemplate: 'fallbackTemplate'
};

exports.Prisma.NotificationLogScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  channel: 'channel',
  status: 'status',
  error: 'error',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationActionScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  label: 'label',
  action: 'action',
  type: 'type',
  data: 'data',
  isPrimary: 'isPrimary',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationGroupScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  description: 'description',
  isRead: 'isRead',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationSettingsScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  category: 'category',
  type: 'type',
  channel: 'channel',
  isEnabled: 'isEnabled',
  frequency: 'frequency',
  quietHours: 'quietHours',
  filters: 'filters',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationAnalyticsScalarFieldEnum = {
  id: 'id',
  notificationId: 'notificationId',
  channel: 'channel',
  sentCount: 'sentCount',
  deliveredCount: 'deliveredCount',
  readCount: 'readCount',
  clickCount: 'clickCount',
  actionCount: 'actionCount',
  errorCount: 'errorCount',
  avgDeliveryTime: 'avgDeliveryTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageTemplateScalarFieldEnum = {
  id: 'id',
  type: 'type',
  title: 'title',
  content: 'content',
  variables: 'variables',
  isActive: 'isActive',
  language: 'language',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageQueueScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  status: 'status',
  retryCount: 'retryCount',
  lastAttemptAt: 'lastAttemptAt',
  nextAttemptAt: 'nextAttemptAt',
  error: 'error',
  metadata: 'metadata',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageAnalyticsScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  totalMessages: 'totalMessages',
  totalAttachments: 'totalAttachments',
  totalCalls: 'totalCalls',
  avgResponseTime: 'avgResponseTime',
  peakActivityTime: 'peakActivityTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContentBlockScalarFieldEnum = {
  id: 'id',
  type: 'type',
  content: 'content',
  metadata: 'metadata',
  order: 'order',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  messageId: 'messageId',
  notificationId: 'notificationId'
};

exports.Prisma.MediaScalarFieldEnum = {
  id: 'id',
  type: 'type',
  url: 'url',
  filename: 'filename',
  size: 'size',
  width: 'width',
  height: 'height',
  duration: 'duration',
  thumbnail: 'thumbnail',
  metadata: 'metadata',
  contentBlockId: 'contentBlockId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PollScalarFieldEnum = {
  id: 'id',
  question: 'question',
  isMultiChoice: 'isMultiChoice',
  endDate: 'endDate',
  isClosed: 'isClosed',
  contentBlockId: 'contentBlockId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PollOptionScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  text: 'text',
  votes: 'votes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PollVoteScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  optionId: 'optionId',
  userId: 'userId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FormScalarFieldEnum = {
  id: 'id',
  title: 'title',
  description: 'description',
  isActive: 'isActive',
  contentBlockId: 'contentBlockId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FormFieldScalarFieldEnum = {
  id: 'id',
  formId: 'formId',
  type: 'type',
  label: 'label',
  placeholder: 'placeholder',
  required: 'required',
  options: 'options',
  validation: 'validation',
  order: 'order',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FormSubmissionScalarFieldEnum = {
  id: 'id',
  formId: 'formId',
  userId: 'userId',
  submittedAt: 'submittedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FormResponseScalarFieldEnum = {
  id: 'id',
  submissionId: 'submissionId',
  fieldId: 'fieldId',
  value: 'value',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VerificationCodeScalarFieldEnum = {
  id: 'id',
  email: 'email',
  code: 'code',
  createdAt: 'createdAt',
  expiresAt: 'expiresAt',
  used: 'used'
};

exports.Prisma.SocialMediaConnectionScalarFieldEnum = {
  id: 'id',
  businessId: 'businessId',
  platform: 'platform',
  connected: 'connected',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  channelId: 'channelId',
  expiresAt: 'expiresAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UserStatus = exports.$Enums.UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.VerificationStatus = exports.$Enums.VerificationStatus = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED'
};

exports.Gender = exports.$Enums.Gender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE'
};

exports.BusinessType = exports.$Enums.BusinessType = {
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE'
};

exports.BusinessStatus = exports.$Enums.BusinessStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.BusinessModel = exports.$Enums.BusinessModel = {
  B2B: 'B2B',
  B2C: 'B2C',
  D2C: 'D2C',
  MARKETPLACE: 'MARKETPLACE'
};

exports.BusinessOperationMode = exports.$Enums.BusinessOperationMode = {
  ONLINE: 'ONLINE',
  PHYSICAL: 'PHYSICAL',
  HYBRID: 'HYBRID'
};

exports.Currency = exports.$Enums.Currency = {
  KES: 'KES',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  MPESA: 'MPESA',
  CARD: 'CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CASH: 'CASH',
  CRYPTO: 'CRYPTO'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT'
};

exports.ServiceStatus = exports.$Enums.ServiceStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
  COMPLETED: 'COMPLETED'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  HELD_IN_ESCROW: 'HELD_IN_ESCROW',
  PARTIALLY_RELEASED: 'PARTIALLY_RELEASED',
  FULLY_RELEASED: 'FULLY_RELEASED',
  DISPUTED: 'DISPUTED',
  CANCELLED: 'CANCELLED'
};

exports.CartStatus = exports.$Enums.CartStatus = {
  ACTIVE: 'ACTIVE',
  CHECKOUT_COMPLETED: 'CHECKOUT_COMPLETED',
  ABANDONED: 'ABANDONED'
};

exports.MessageStatus = exports.$Enums.MessageStatus = {
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED'
};

exports.MessageDirection = exports.$Enums.MessageDirection = {
  INCOMING: 'INCOMING',
  OUTGOING: 'OUTGOING'
};

exports.MessageEncryption = exports.$Enums.MessageEncryption = {
  NONE: 'NONE',
  END_TO_END: 'END_TO_END',
  GROUP: 'GROUP'
};

exports.MessageType = exports.$Enums.MessageType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  FILE: 'FILE',
  LOCATION: 'LOCATION',
  CONTACT: 'CONTACT',
  SYSTEM: 'SYSTEM',
  NOTIFICATION: 'NOTIFICATION'
};

exports.DisputeStatus = exports.$Enums.DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.TeamRole = exports.$Enums.TeamRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  STORE_MANAGER: 'STORE_MANAGER',
  FINANCE_MANAGER: 'FINANCE_MANAGER',
  CUSTOMER_SERVICE_LEAD: 'CUSTOMER_SERVICE_LEAD',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  LOGISTICS_COORDINATOR: 'LOGISTICS_COORDINATOR',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  CONTENT_CREATOR: 'CONTENT_CREATOR',
  SOCIAL_MEDIA_MANAGER: 'SOCIAL_MEDIA_MANAGER',
  QUALITY_ASSURANCE: 'QUALITY_ASSURANCE',
  TECHNICAL_SUPPORT: 'TECHNICAL_SUPPORT',
  SALES_REPRESENTATIVE: 'SALES_REPRESENTATIVE',
  PROCUREMENT_OFFICER: 'PROCUREMENT_OFFICER'
};

exports.ContentStatus = exports.$Enums.ContentStatus = {
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  POSTED: 'POSTED',
  FAILED: 'FAILED',
  ARCHIVED: 'ARCHIVED'
};

exports.ChatStatus = exports.$Enums.ChatStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED'
};

exports.IntegrationStatus = exports.$Enums.IntegrationStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  FAILED: 'FAILED'
};

exports.VerificationType = exports.$Enums.VerificationType = {
  BUSINESS_REGISTRATION: 'BUSINESS_REGISTRATION',
  TAX_COMPLIANCE: 'TAX_COMPLIANCE',
  IDENTITY_VERIFICATION: 'IDENTITY_VERIFICATION',
  ADDRESS_VERIFICATION: 'ADDRESS_VERIFICATION',
  BANK_ACCOUNT: 'BANK_ACCOUNT',
  MOBILE_MONEY: 'MOBILE_MONEY'
};

exports.SubscriptionTier = exports.$Enums.SubscriptionTier = {
  FREE: 'FREE',
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE'
};

exports.ServiceType = exports.$Enums.ServiceType = {
  CONSULTATION: 'CONSULTATION',
  REPAIR: 'REPAIR',
  MAINTENANCE: 'MAINTENANCE',
  INSTALLATION: 'INSTALLATION',
  TRAINING: 'TRAINING',
  SUPPORT: 'SUPPORT',
  CUSTOM: 'CUSTOM'
};

exports.DigitalServiceType = exports.$Enums.DigitalServiceType = {
  SOFTWARE_DEVELOPMENT: 'SOFTWARE_DEVELOPMENT',
  WEB_DEVELOPMENT: 'WEB_DEVELOPMENT',
  MOBILE_APP_DEVELOPMENT: 'MOBILE_APP_DEVELOPMENT',
  UI_UX_DESIGN: 'UI_UX_DESIGN',
  GRAPHIC_DESIGN: 'GRAPHIC_DESIGN',
  CONTENT_CREATION: 'CONTENT_CREATION',
  SOCIAL_MEDIA_MANAGEMENT: 'SOCIAL_MEDIA_MANAGEMENT',
  DIGITAL_MARKETING: 'DIGITAL_MARKETING',
  SEO_SERVICES: 'SEO_SERVICES',
  VIDEO_PRODUCTION: 'VIDEO_PRODUCTION',
  DATA_ANALYTICS: 'DATA_ANALYTICS',
  CLOUD_SERVICES: 'CLOUD_SERVICES',
  IT_CONSULTING: 'IT_CONSULTING',
  CYBERSECURITY: 'CYBERSECURITY',
  CUSTOM: 'CUSTOM'
};

exports.PaymentModel = exports.$Enums.PaymentModel = {
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING',
  SUBSCRIPTION: 'SUBSCRIPTION',
  PAY_PER_USE: 'PAY_PER_USE',
  MILESTONE_BASED: 'MILESTONE_BASED',
  TIME_BASED: 'TIME_BASED',
  VALUE_BASED: 'VALUE_BASED'
};

exports.ProductType = exports.$Enums.ProductType = {
  PHYSICAL: 'PHYSICAL',
  DIGITAL: 'DIGITAL',
  SUBSCRIPTION: 'SUBSCRIPTION',
  RENTAL: 'RENTAL'
};

exports.PaymentFrequency = exports.$Enums.PaymentFrequency = {
  DAILY: 'DAILY',
  WEEKLY: 'WEEKLY',
  BIWEEKLY: 'BIWEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  ANNUALLY: 'ANNUALLY',
  CUSTOM: 'CUSTOM'
};

exports.DeliverableStatus = exports.$Enums.DeliverableStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  REVISED: 'REVISED'
};

exports.EscrowStatus = exports.$Enums.EscrowStatus = {
  ACTIVE: 'ACTIVE',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED'
};

exports.NotificationType = exports.$Enums.NotificationType = {
  USER_REGISTERED: 'USER_REGISTERED',
  USER_VERIFIED: 'USER_VERIFIED',
  USER_UPDATED: 'USER_UPDATED',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',
  EMAIL_CHANGED: 'EMAIL_CHANGED',
  PHONE_CHANGED: 'PHONE_CHANGED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_DELETED: 'ACCOUNT_DELETED',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
  TWO_FACTOR_ENABLED: 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED: 'TWO_FACTOR_DISABLED',
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  BUSINESS_CREATED: 'BUSINESS_CREATED',
  BUSINESS_UPDATED: 'BUSINESS_UPDATED',
  BUSINESS_VERIFIED: 'BUSINESS_VERIFIED',
  BUSINESS_SUSPENDED: 'BUSINESS_SUSPENDED',
  BUSINESS_DELETED: 'BUSINESS_DELETED',
  BUSINESS_INVITATION: 'BUSINESS_INVITATION',
  BUSINESS_ROLE_CHANGED: 'BUSINESS_ROLE_CHANGED',
  BUSINESS_PERMISSION_CHANGED: 'BUSINESS_PERMISSION_CHANGED',
  BUSINESS_SETTINGS_UPDATED: 'BUSINESS_SETTINGS_UPDATED',
  BUSINESS_ANALYTICS_READY: 'BUSINESS_ANALYTICS_READY',
  SERVICE_CREATED: 'SERVICE_CREATED',
  SERVICE_UPDATED: 'SERVICE_UPDATED',
  SERVICE_DELETED: 'SERVICE_DELETED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  PRODUCT_OUT_OF_STOCK: 'PRODUCT_OUT_OF_STOCK',
  PRODUCT_BACK_IN_STOCK: 'PRODUCT_BACK_IN_STOCK',
  INVENTORY_LOW: 'INVENTORY_LOW',
  INVENTORY_CRITICAL: 'INVENTORY_CRITICAL',
  PRICE_CHANGED: 'PRICE_CHANGED',
  DISCOUNT_ADDED: 'DISCOUNT_ADDED',
  DISCOUNT_EXPIRED: 'DISCOUNT_EXPIRED',
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  ORDER_COMPLETED: 'ORDER_COMPLETED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  ORDER_DISPUTED: 'ORDER_DISPUTED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REFUNDED: 'PAYMENT_REFUNDED',
  PAYMENT_DISPUTED: 'PAYMENT_DISPUTED',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  INVOICE_PAID: 'INVOICE_PAID',
  INVOICE_OVERDUE: 'INVOICE_OVERDUE',
  SUBSCRIPTION_CREATED: 'SUBSCRIPTION_CREATED',
  SUBSCRIPTION_UPDATED: 'SUBSCRIPTION_UPDATED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
  SUBSCRIPTION_RENEWED: 'SUBSCRIPTION_RENEWED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  AGREEMENT_CREATED: 'AGREEMENT_CREATED',
  AGREEMENT_UPDATED: 'AGREEMENT_UPDATED',
  AGREEMENT_COMPLETED: 'AGREEMENT_COMPLETED',
  AGREEMENT_CANCELLED: 'AGREEMENT_CANCELLED',
  AGREEMENT_EXPIRED: 'AGREEMENT_EXPIRED',
  DELIVERABLE_CREATED: 'DELIVERABLE_CREATED',
  DELIVERABLE_UPDATED: 'DELIVERABLE_UPDATED',
  DELIVERABLE_COMPLETED: 'DELIVERABLE_COMPLETED',
  DELIVERABLE_APPROVED: 'DELIVERABLE_APPROVED',
  DELIVERABLE_REJECTED: 'DELIVERABLE_REJECTED',
  DELIVERABLE_REVISED: 'DELIVERABLE_REVISED',
  MILESTONE_REACHED: 'MILESTONE_REACHED',
  MILESTONE_APPROVED: 'MILESTONE_APPROVED',
  MILESTONE_REJECTED: 'MILESTONE_REJECTED',
  ESCROW_CREATED: 'ESCROW_CREATED',
  ESCROW_RELEASED: 'ESCROW_RELEASED',
  ESCROW_REFUNDED: 'ESCROW_REFUNDED',
  ESCROW_DISPUTED: 'ESCROW_DISPUTED',
  DISPUTE_CREATED: 'DISPUTE_CREATED',
  DISPUTE_UPDATED: 'DISPUTE_UPDATED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  DISPUTE_ESCALATED: 'DISPUTE_ESCALATED',
  DISPUTE_MESSAGE_ADDED: 'DISPUTE_MESSAGE_ADDED',
  DISPUTE_DOCUMENT_ADDED: 'DISPUTE_DOCUMENT_ADDED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  MESSAGE_READ: 'MESSAGE_READ',
  MESSAGE_DELETED: 'MESSAGE_DELETED',
  CHAT_STARTED: 'CHAT_STARTED',
  CHAT_ENDED: 'CHAT_ENDED',
  CHAT_INVITATION: 'CHAT_INVITATION',
  CHAT_LEFT: 'CHAT_LEFT',
  CHAT_MUTED: 'CHAT_MUTED',
  CHAT_UNMUTED: 'CHAT_UNMUTED',
  GROUP_CHAT_CREATED: 'GROUP_CHAT_CREATED',
  GROUP_CHAT_UPDATED: 'GROUP_CHAT_UPDATED',
  GROUP_CHAT_DELETED: 'GROUP_CHAT_DELETED',
  GROUP_MEMBER_ADDED: 'GROUP_MEMBER_ADDED',
  GROUP_MEMBER_REMOVED: 'GROUP_MEMBER_REMOVED',
  GROUP_MEMBER_LEFT: 'GROUP_MEMBER_LEFT',
  VOICE_CALL_STARTED: 'VOICE_CALL_STARTED',
  VOICE_CALL_ENDED: 'VOICE_CALL_ENDED',
  VIDEO_CALL_STARTED: 'VIDEO_CALL_STARTED',
  VIDEO_CALL_ENDED: 'VIDEO_CALL_ENDED',
  CALL_MISSED: 'CALL_MISSED',
  CALL_DECLINED: 'CALL_DECLINED',
  REVIEW_RECEIVED: 'REVIEW_RECEIVED',
  REVIEW_UPDATED: 'REVIEW_UPDATED',
  REVIEW_DELETED: 'REVIEW_DELETED',
  REVIEW_REPLIED: 'REVIEW_REPLIED',
  RATING_RECEIVED: 'RATING_RECEIVED',
  RATING_UPDATED: 'RATING_UPDATED',
  FEEDBACK_RECEIVED: 'FEEDBACK_RECEIVED',
  FEEDBACK_UPDATED: 'FEEDBACK_UPDATED',
  SYSTEM_UPDATE: 'SYSTEM_UPDATE',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  SECURITY_ALERT: 'SECURITY_ALERT',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  LOGIN_DEVICE_NEW: 'LOGIN_DEVICE_NEW',
  LOGIN_LOCATION_NEW: 'LOGIN_LOCATION_NEW',
  PASSWORD_RESET_REQUESTED: 'PASSWORD_RESET_REQUESTED',
  PASSWORD_RESET_COMPLETED: 'PASSWORD_RESET_COMPLETED',
  ACCOUNT_RECOVERY_STARTED: 'ACCOUNT_RECOVERY_STARTED',
  ACCOUNT_RECOVERY_COMPLETED: 'ACCOUNT_RECOVERY_COMPLETED',
  DATA_EXPORT_REQUESTED: 'DATA_EXPORT_REQUESTED',
  DATA_EXPORT_COMPLETED: 'DATA_EXPORT_COMPLETED',
  DATA_DELETION_REQUESTED: 'DATA_DELETION_REQUESTED',
  DATA_DELETION_COMPLETED: 'DATA_DELETION_COMPLETED',
  PROMOTION_CREATED: 'PROMOTION_CREATED',
  PROMOTION_UPDATED: 'PROMOTION_UPDATED',
  PROMOTION_EXPIRED: 'PROMOTION_EXPIRED',
  COUPON_CREATED: 'COUPON_CREATED',
  COUPON_REDEEMED: 'COUPON_REDEEMED',
  COUPON_EXPIRED: 'COUPON_EXPIRED',
  LOYALTY_POINTS_EARNED: 'LOYALTY_POINTS_EARNED',
  LOYALTY_POINTS_REDEEMED: 'LOYALTY_POINTS_REDEEMED',
  LOYALTY_TIER_CHANGED: 'LOYALTY_TIER_CHANGED',
  REFERRAL_SENT: 'REFERRAL_SENT',
  REFERRAL_ACCEPTED: 'REFERRAL_ACCEPTED',
  REFERRAL_REWARDED: 'REFERRAL_REWARDED',
  REPORT_GENERATED: 'REPORT_GENERATED',
  REPORT_READY: 'REPORT_READY',
  REPORT_FAILED: 'REPORT_FAILED',
  ANALYTICS_READY: 'ANALYTICS_READY',
  INSIGHT_GENERATED: 'INSIGHT_GENERATED',
  TREND_DETECTED: 'TREND_DETECTED',
  ABNORMAL_ACTIVITY: 'ABNORMAL_ACTIVITY',
  CUSTOM: 'CUSTOM'
};

exports.NotificationPriority = exports.$Enums.NotificationPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

exports.NotificationStatus = exports.$Enums.NotificationStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  DELIVERED: 'DELIVERED',
  READ: 'READ',
  FAILED: 'FAILED',
  ARCHIVED: 'ARCHIVED'
};

exports.NotificationChannel = exports.$Enums.NotificationChannel = {
  EMAIL: 'EMAIL',
  SMS: 'SMS',
  PUSH: 'PUSH',
  IN_APP: 'IN_APP',
  WEBHOOK: 'WEBHOOK'
};

exports.ContentType = exports.$Enums.ContentType = {
  TEXT: 'TEXT',
  IMAGE: 'IMAGE',
  VIDEO: 'VIDEO',
  AUDIO: 'AUDIO',
  FILE: 'FILE',
  LOCATION: 'LOCATION',
  CONTACT: 'CONTACT',
  SYSTEM: 'SYSTEM',
  NOTIFICATION: 'NOTIFICATION',
  RICH_TEXT: 'RICH_TEXT',
  EMBED: 'EMBED',
  POLL: 'POLL',
  FORM: 'FORM',
  BUTTON: 'BUTTON',
  CAROUSEL: 'CAROUSEL',
  PRODUCT: 'PRODUCT',
  SERVICE: 'SERVICE',
  ORDER: 'ORDER',
  PAYMENT: 'PAYMENT',
  ESCROW: 'ESCROW',
  DISPUTE: 'DISPUTE'
};

exports.Prisma.ModelName = {
  User: 'User',
  Business: 'Business',
  Product: 'Product',
  ProductMedia: 'ProductMedia',
  Service: 'Service',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Cart: 'Cart',
  CartItem: 'CartItem',
  Message: 'Message',
  MessageAttachment: 'MessageAttachment',
  MessageReaction: 'MessageReaction',
  MessageRead: 'MessageRead',
  Conversation: 'Conversation',
  ConversationParticipant: 'ConversationParticipant',
  Call: 'Call',
  CallParticipant: 'CallParticipant',
  Dispute: 'Dispute',
  BusinessTeamMember: 'BusinessTeamMember',
  ProductVariant: 'ProductVariant',
  ProductAnalytics: 'ProductAnalytics',
  ProductSEO: 'ProductSEO',
  SocialMediaContent: 'SocialMediaContent',
  ChatSession: 'ChatSession',
  WhatsApp: 'WhatsApp',
  Rating: 'Rating',
  BusinessVerification: 'BusinessVerification',
  BusinessSubscription: 'BusinessSubscription',
  BusinessHours: 'BusinessHours',
  ServiceCategory: 'ServiceCategory',
  ProductCategory: 'ProductCategory',
  ServiceSchedule: 'ServiceSchedule',
  Inventory: 'Inventory',
  ServiceProvider: 'ServiceProvider',
  Supplier: 'Supplier',
  ServiceAgreement: 'ServiceAgreement',
  Deliverable: 'Deliverable',
  Escrow: 'Escrow',
  Payment: 'Payment',
  ServiceReview: 'ServiceReview',
  Notification: 'Notification',
  NotificationPreference: 'NotificationPreference',
  NotificationTemplate: 'NotificationTemplate',
  NotificationLog: 'NotificationLog',
  NotificationAction: 'NotificationAction',
  NotificationGroup: 'NotificationGroup',
  NotificationSettings: 'NotificationSettings',
  NotificationAnalytics: 'NotificationAnalytics',
  MessageTemplate: 'MessageTemplate',
  MessageQueue: 'MessageQueue',
  MessageAnalytics: 'MessageAnalytics',
  ContentBlock: 'ContentBlock',
  Media: 'Media',
  Poll: 'Poll',
  PollOption: 'PollOption',
  PollVote: 'PollVote',
  Form: 'Form',
  FormField: 'FormField',
  FormSubmission: 'FormSubmission',
  FormResponse: 'FormResponse',
  VerificationCode: 'VerificationCode',
  SocialMediaConnection: 'SocialMediaConnection'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
