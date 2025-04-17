
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
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
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
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
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
  metadata: 'metadata'
};

exports.Prisma.BusinessScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  name: 'name',
  description: 'description',
  bio: 'bio',
  type: 'type',
  category: 'category',
  productCategories: 'productCategories',
  serviceCategories: 'serviceCategories',
  status: 'status',
  verificationStatus: 'verificationStatus',
  email: 'email',
  phone: 'phone',
  address: 'address',
  logo: 'logo',
  coverImage: 'coverImage',
  images: 'images',
  businessModel: 'businessModel',
  operationMode: 'operationMode',
  paymentMethods: 'paymentMethods',
  currency: 'currency',
  revenue: 'revenue',
  businessHours: 'businessHours',
  blockchainTxHash: 'blockchainTxHash',
  ipfsUrl: 'ipfsUrl',
  ipfsMetadata: 'ipfsMetadata',
  averageRating: 'averageRating',
  reviewCount: 'reviewCount',
  documents: 'documents',
  metadata: 'metadata',
  socialMedia: 'socialMedia',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
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
  updatedAt: 'updatedAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  serviceId: 'serviceId',
  quantity: 'quantity',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  receiverId: 'receiverId',
  content: 'content',
  status: 'status',
  createdAt: 'createdAt',
  chatSessionId: 'chatSessionId'
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
  permissions: 'permissions',
  createdAt: 'createdAt'
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

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
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

exports.ProductStatus = exports.$Enums.ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
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
  REFUNDED: 'REFUNDED'
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

exports.DisputeStatus = exports.$Enums.DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};

exports.TeamRole = exports.$Enums.TeamRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  MEMBER: 'MEMBER',
  VIEWER: 'VIEWER'
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

exports.Prisma.ModelName = {
  User: 'User',
  Business: 'Business',
  Product: 'Product',
  Service: 'Service',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Cart: 'Cart',
  CartItem: 'CartItem',
  Message: 'Message',
  Dispute: 'Dispute',
  BusinessTeamMember: 'BusinessTeamMember',
  ProductVariant: 'ProductVariant',
  ProductAnalytics: 'ProductAnalytics',
  ProductSEO: 'ProductSEO',
  SocialMediaContent: 'SocialMediaContent',
  ChatSession: 'ChatSession',
  WhatsApp: 'WhatsApp',
  Rating: 'Rating'
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
