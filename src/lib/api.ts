export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface LoginResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone?: string;
      accountStatus: string;
    };
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch {
    return {
      success: false,
      error: { code: "NETWORK_ERROR", message: "Failed to connect to authentication server" },
    };
  }
}

export async function getMeApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch current user" } };
  }
}

export async function getDriverProfileApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch driver profile" } };
  }
}

export async function updateDriverAvailabilityApi(token: string, availabilityStatus: "OFFLINE" | "ONLINE" | "UNAVAILABLE") {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ availabilityStatus }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update availability" } };
  }
}

export async function updateDriverLocationApi(token: string, latitude: number, longitude: number) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/location`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ latitude, longitude }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update location" } };
  }
}

export async function getDriverTripsApi(token: string, status?: string, page = 1, limit = 20) {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append("status", status);
    const res = await fetch(`${API_BASE_URL}/drivers/me/trips?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch driver trips" } };
  }
}

export async function getDriverTripByIdApi(token: string, tripId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch driver trip details" } };
  }
}

export async function updateDriverTripNotesApi(token: string, tripId: string, driverNotes: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/trips/${tripId}/notes`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ driverNotes }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update trip notes" } };
  }
}

export async function updateDriverTripStatusApi(
  token: string,
  tripId: string,
  status: string,
  extraData?: { receiverSignature?: string; receiverName?: string; receiverRelationship?: string }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/trips/${tripId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status, ...extraData }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update trip status" } };
  }
}


export async function getDriverEarningsApi(token: string, startDate?: string, endDate?: string) {
  try {
    let url = `${API_BASE_URL}/drivers/me/earnings`;
    if (startDate && endDate) {
      url += `?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
    }
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch earnings" } };
  }
}

export async function getTodayShiftApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/shifts/today`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch shift status" } };
  }
}

export async function getScheduleSummaryApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/schedule-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch schedule summary" } };
  }
}

export async function startShiftApi(
  token: string,
  data: {
    odometer: string | number;
    fuel?: string;
    condition?: string;
    notes?: string;
    photoUrl?: string;
    photos?: string[];
    startPhotoUrls?: string[];
  }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/shifts/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to start shift" } };
  }
}

export async function endShiftApi(
  token: string,
  data: {
    odometer: string | number;
    fuel?: string;
    condition?: string;
    notes?: string;
    photoUrl?: string;
    photos?: string[];
    endPhotoUrls?: string[];
  }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/shifts/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to end shift" } };
  }
}

export async function uploadImageApi(token: string, file: File, category = "avatars") {
  try {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("category", category);
    const res = await fetch(`${API_BASE_URL}/upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to upload image" } };
  }
}



export async function updateDriverProfileApi(
  token: string,
  data: { name?: string; phone?: string; licenseNumber?: string; licenseExpirationDate?: string; avatarUrl?: string }
) {
  try {
    const res = await fetch(`${API_BASE_URL}/drivers/me/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to update profile" } };
  }
}


export async function getDispatchNumberApi(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/dispatch-number`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to fetch dispatch number" } };
  }
}

export async function forgotPasswordApi(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to send reset code" } };
  }
}

export async function verifyOtpApi(email: string, otp: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to verify code" } };
  }
}

export async function resetPasswordApi(email: string, otp: string, newPassword: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return await res.json();
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Failed to reset password" } };
  }
}
