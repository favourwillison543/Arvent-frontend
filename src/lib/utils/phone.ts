// lib/utils/phone.ts

export function normalizeNigerianPhone(
    phone: string,
  ): string {
    const value = phone.trim().replace(/\s+/g, "");
  
    if (value.startsWith("+234")) {
      return value;
    }
  
    if (value.startsWith("234")) {
      return `+${value}`;
    }
  
    if (value.startsWith("0")) {
      return `+234${value.slice(1)}`;
    }
  
    return value;
  }
  
  export function formatPhoneForDisplay(
    phone: string,
  ): string {
    const normalized = normalizeNigerianPhone(phone);
  
    if (!normalized.startsWith("+234")) {
      return phone;
    }
  
    const localNumber = `0${normalized.slice(4)}`;
  
    if (localNumber.length !== 11) {
      return phone;
    }
  
    return localNumber.replace(
      /^(\d{4})(\d{3})(\d{4})$/,
      "$1 $2 $3",
    );
  }
  
  export function getPhoneLast4(
    phone: string,
  ): string {
    const digits = phone.replace(/\D/g, "");
  
    return digits.slice(-4);
  }
  
  export function createWhatsAppUrl(
    phone: string,
    message: string,
  ): string {
    const normalized = normalizeNigerianPhone(phone);
    const digits = normalized.replace(/\D/g, "");
  
    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
  }