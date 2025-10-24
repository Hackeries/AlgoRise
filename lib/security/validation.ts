// Input validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

export const validateHandle = (handle: string): boolean => {
  // Codeforces handle validation
  const handleRegex = /^[a-zA-Z0-9_]{1,24}$/
  return handleRegex.test(handle)
}

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (password.length < 8) errors.push("Password must be at least 8 characters")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain lowercase letter")
  if (!/[0-9]/.test(password)) errors.push("Password must contain number")

  return {
    valid: errors.length === 0,
    errors,
  }
}

export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .slice(0, 1000) // Limit length
}

export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}
