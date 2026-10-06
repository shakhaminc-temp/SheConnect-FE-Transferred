// ============================================================
//  mockData.js  –  Realistic dummy data for all modules
//  Mirrors the exact shapes returned by the real backend API.
//  To switch to real BE: comment out mock imports in services.
// ============================================================

// ─────────────────────────────────────────────
//  AUTH MODULE
// ─────────────────────────────────────────────

/**
 * Logged-in user profile  (GET /auth/me)
 */
export const mockUser = {
    id: 1,
    name: "Sakshi Thombre",
    email_id: "sakshi.thombre@gmail.com",
    phone_no: "9876543210",
    college: "IMCC",
    city: "Pune",
    profile_pic: null,
    is_active: true,
    created_at: "2024-11-15T08:30:00Z",
    emergency_contacts: [
        {
            id: 1,
            emergency_name: "Mom",
            phone_no: "9999988888",
            gender: "Female",
            relation: "Mother",
        },
        {
            id: 2,
            emergency_name: "Riya (Friend)",
            phone_no: "9911223344",
            gender: "Female",
            relation: "Friend",
        },
    ],
};

/**
 * Login response  (POST /auth/login)
 */
export const mockLoginResponse = {
    access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mockDevToken.signature",
    token_type: "Bearer",
    user: mockUser,
};

/**
 * Signup OTP response  (POST /auth/signup)
 */
export const mockSignupResponse = {
    message: "OTP sent to sakshi.thombre@gmail.com",
    otp_token: "mock-otp-token-abc123",
    email: "sakshi.thombre@gmail.com",
};

/**
 * College list  (GET /auth/colleges)
 */
export const mockColleges = [
    { college_id: 1, college_name: "IMCC" },
];

// ─────────────────────────────────────────────
//  TRIP / START-TRIP MODULE
// ─────────────────────────────────────────────

/**
 * Travel intent created when user submits Start Trip form
 * (POST /trips/intent)
 */
export const mockTripIntent = {
    id: 42,
    user_id: 1,
    start_location: "Pune",
    end_location: "Mumbai",
    transport_mode: "Car",
    transport_number: "MH 12 AB 5678",
    status: "active",
    created_at: "2026-02-20T09:00:00Z",
};

// ─────────────────────────────────────────────
//  MATCH-MAKING MODULE
// ─────────────────────────────────────────────

/**
 * Potential matches to send connection request
 * (GET /matchmaking/potential?intent_id=42)
 */
export const mockPotentialMatches = [
    {
        id: 101,
        name: "Priya Sharma",
        start: "Pune",
        end: "Mumbai",
        area: "Kothrud",
        mode: "Car",
        college: "IMCC",
        mutual_friends: 2,
        verified: true,
        status: "active",
        privacy_type: "details",
    },
    {
        id: 102,
        name: "Anjali Gupta",
        start: "Delhi",
        end: "Mumbai",
        area: "Aerocity",
        mode: "Train",
        college: "IMCC",
        mutual_friends: 0,
        verified: true,
        status: "Connect",
        privacy_type: "anonymous",
    },
    {
        id: 103,
        name: "Riya Singh",
        start: "Mumbai",
        end: "Vanaj",
        area: "Andheri",
        mode: "Bus",
        college: "IMCC",
        mutual_friends: 1,
        verified: false,
        status: "Connect",
        privacy_type: "details",
    },
    {
        id: 104,
        name: "Meera Joshi",
        start: "Pune",
        end: "Mumbai",
        area: "Baner",
        mode: "Cab",
        college: "IMCC",
        mutual_friends: 0,
        verified: true,
        status: "Connect",
        privacy_type: "anonymous",
    },
    {
        id: 105,
        name: "Kavya Deshmukh",
        start: "Mumbai",
        end: "Pune",
        area: "Dadar",
        mode: "Car",
        college: "IMCC",
        mutual_friends: 3,
        verified: true,
        status: "Connect",
        privacy_type: "details",
    },
    {
        id: 106,
        name: "Sneha Kulkarni",
        start: "Hyderabad",
        end: "Bangalore",
        area: "Gachibowli",
        mode: "Flight",
        college: "IMCC",
        mutual_friends: 0,
        verified: true,
        status: "Connect",
        privacy_type: "details",
    },
    {
        id: 107,
        name: "Nikita Rao",
        start: "Delhi",
        end: "Jaipur",
        area: "Connaught Place",
        mode: "Train",
        college: "IMCC",
        mutual_friends: 1,
        verified: false,
        status: "Connect",
        privacy_type: "anonymous",
    },
    {
        id: 108,
        name: "Aditi Verma",
        start: "Pune",
        end: "Mumbai",
        area: "Hinjewadi",
        mode: "Railway",
        college: "IMCC",
        mutual_friends: 2,
        verified: true,
        status: "Connect",
        privacy_type: "details",
    },
    {
        id: 109,
        name: "Kunti Verma",
        start: "Vanaz",
        end: "Hinjawadi",
        area: "Paud Road",
        mode: "Car",
        college: "IMCC",
        mutual_friends: 2,
        verified: true,
        status: "Connect",
        privacy_type: "details",
    },
    {
        id: 110,
        name: "Kunti Verma",
        start: "Kothrud",
        end: "Hinjawadi",
        area: "Karve Nagar",
        mode: "Car",
        college: "IMCC",
        mutual_friends: 2,
        verified: true,
        status: "Connect",
        privacy_type: "anonymous",
    },
];

/**
 * Incoming connection requests
 * (GET /matchmaking/received)
 */
export const mockReceivedRequests = [
    {
        id: 201,
        name: "Sneha Patel",
        start: "Pune",
        end: "Mumbai",
        area: "Dadar",
        mode: "Car",
        college: "IMCC",
        connectionType: "anonymous",
        privacy_type: "anonymous",
        phone: null,
        verified: true,
        requested_at: "2026-02-25T08:15:00Z",
        status: "pending",
    },
    {
        id: 202,
        name: "Kavita Reddy",
        start: "Pune",
        end: "Mumbai",
        area: "Banjara Hills",
        mode: "Car",
        college: "IMCC",
        connectionType: "details",
        privacy_type: "details",
        phone: "+91 87654 32100",
        verified: true,
        requested_at: "2026-02-25T07:45:00Z",
        status: "pending",
    },
];

/**
 * Sent connection requests (for Sent tab)
 * (GET /matchmaking/sent)
 */
export const mockSentRequests = [
    {
        matchId: 101,
        name: "Priya Sharma",
        start: "Pune",
        end: "Mumbai",
        mode: "Car",
        college: "IMCC",
        status: "PENDING",
        sent_at: "2026-02-25T09:00:00Z",
    },
];

/**
 * Connected partner details (personal)
 * (GET /matchmaking/connection/:id)
 */
export const mockConnectedPersonal = {
    id: 301,
    name: "Priya Sharma",
    start: "Pune",
    end: "Mumbai",
    mode: "Car",
    phone: "+91 98765 43210",
    college: "IMCC",
    transport_number: "MH 12 XY 1234",
    connection_type: "details",
    status: "active",
    connected_at: "2026-02-20T09:30:00Z",
};

/**
 * Connected partner details (anonymous)
 * (GET /matchmaking/connection/:id)
 */
export const mockConnectedAnonymous = {
    id: 302,
    start: "Mumbai",
    end: "Pune",
    mode: "Train",
    connection_type: "anonymous",
    status: "active",
    connected_at: "2026-02-20T10:00:00Z",
};

// ─────────────────────────────────────────────
//  BLOG MODULE
// ─────────────────────────────────────────────

/**
 * Community blog posts  (GET /blogs)
 */
export const mockBlogs = [
    {
        id: 1,
        title: "My First Solo Trip from Pune to Goa 🌊",
        content:
            "I was nervous about traveling alone for the first time, but SheConnect made it so much easier! I found Anjali who was heading in the same direction. We boarded the Konkan Kanya Express together and it was the best trip of my life. The coastal views were breathtaking and I felt completely safe throughout.",
        author: "Sakshi Thombre",
        author_id: 1,
        date: "2026-01-10",
        likes: 34,
        tags: ["solo travel", "goa", "train"],
    },

    {
        id: 3,
        title: "Night Bus Mumbai to Pune – Was It Safe?",
        content:
            "I had to travel late at night and was skeptical. I used SheConnect, matched with two other women taking the same bus, and we all sat together. Felt completely secure! Highly recommend the app for late-night travel especially.",
        author: "Priya M.",
        author_id: 4,
        date: "2026-02-01",
        likes: 56,
        tags: ["nighttravel", "bus", "mumbai"],
    },
    {
        id: 4,
        title: "Trekking Alone in Coorg – My Experience",
        content:
            "Coorg is stunning but going alone felt daunting. I connected with three other women through SheConnect who were also heading to Coorg the same weekend. We formed an amazing group, hired a cab together, and even split accommodation. Saved money AND made friends!",
        author: "Meera K.",
        author_id: 7,
        date: "2026-02-15",
        likes: 89,
        tags: ["trekking", "coorg", "grouptravel"],
    },
];

// ─────────────────────────────────────────────
//  SETTINGS / PASSWORD MODULE
// ─────────────────────────────────────────────

/**
 * Password change response  (POST /auth/reset-password)
 */
export const mockPasswordChangeResponse = {
    message: "Password updated successfully.",
    success: true,
};

// ─────────────────────────────────────────────
//  NOTIFICATIONS (future use)
// ─────────────────────────────────────────────

export const mockNotifications = [
    {
        id: 1,
        type: "connection_request",
        message: "Sneha Patel wants to travel with you (Mumbai → Pune).",
        read: false,
        created_at: "2026-02-20T08:15:00Z",
    },
    {
        id: 2,
        type: "request_accepted",
        message: "Kavita Reddy accepted your connection request.",
        read: false,
        created_at: "2026-02-19T20:00:00Z",
    },
    {
        id: 3,
        type: "trip_reminder",
        message: "Your trip to Mumbai is scheduled for today. Stay safe! 💜",
        read: true,
        created_at: "2026-02-20T06:00:00Z",
    },
];
