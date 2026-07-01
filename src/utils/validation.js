// Validation utility functions for form inputs

export const validators = {
  required: (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return !isNaN(value);
    return true;
  },
  
  email: (value) => {
    if (!value) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  phone: (value) => {
    if (!value) return false;
    const phoneRegex = /^[0-9+\s-()]{10,20}$/;
    return phoneRegex.test(value.toString());
  },
  
  number: (value) => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },
  
  positiveNumber: (value) => {
    return validators.number(value) && parseFloat(value) > 0;
  },
  
  nonNegativeNumber: (value) => {
    return validators.number(value) && parseFloat(value) >= 0;
  },
  
  integer: (value) => {
    return Number.isInteger(Number(value));
  },
  
  positiveInteger: (value) => {
    return validators.integer(value) && parseInt(value) > 0;
  },
  
  barcode: (value) => {
    if (!value) return false;
    return /^[0-9]{8,13}$/.test(value.toString());
  },
  
  minLength: (value, min) => {
    if (!value) return false;
    return value.toString().length >= min;
  },
  
  maxLength: (value, max) => {
    if (!value) return true;
    return value.toString().length <= max;
  },
  
  minValue: (value, min) => {
    return validators.number(value) && parseFloat(value) >= min;
  },
  
  maxValue: (value, max) => {
    return validators.number(value) && parseFloat(value) <= max;
  },
  
  date: (value) => {
    if (!value) return false;
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },
  
  futureDate: (value) => {
    if (!validators.date(value)) return false;
    return new Date(value) > new Date();
  },
  
  pastDate: (value) => {
    if (!validators.date(value)) return false;
    return new Date(value) < new Date();
  },
  
  percentage: (value) => {
    return validators.number(value) && parseFloat(value) >= 0 && parseFloat(value) <= 100;
  },
};

// Validate a single field
export const validateField = (value, rules) => {
  for (const rule of rules) {
    if (!rule.validator(value)) {
      return { isValid: false, error: rule.message };
    }
  }
  return { isValid: true, error: null };
};

// Validate entire form
export const validateForm = (formData, rules) => {
  const errors = {};
  let isValid = true;
  
  for (const field in rules) {
    const fieldRules = rules[field];
    const value = formData[field];
    
    for (const rule of fieldRules) {
      const validator = typeof rule.validator === 'function' 
        ? rule.validator 
        : validators[rule.validator];
      
      if (!validator) {
        console.warn(`Validator "${rule.validator}" not found`);
        continue;
      }
      
      const params = rule.params || [];
      if (!validator(value, ...params)) {
        errors[field] = rule.message;
        isValid = false;
        break;
      }
    }
  }
  
  return { isValid, errors };
};

// Common validation rule sets
export const commonRules = {
  productName: [
    { validator: validators.required, message: 'Product name is required' },
    { validator: (v) => validators.minLength(v, 2), message: 'Product name must be at least 2 characters' },
    { validator: (v) => validators.maxLength(v, 200), message: 'Product name must not exceed 200 characters' },
  ],
  
  barcode: [
    { validator: validators.barcode, message: 'Invalid barcode format (8-13 digits)' },
  ],
  
  price: [
    { validator: validators.required, message: 'Price is required' },
    { validator: validators.positiveNumber, message: 'Price must be a positive number' },
  ],
  
  quantity: [
    { validator: validators.required, message: 'Quantity is required' },
    { validator: validators.positiveInteger, message: 'Quantity must be a positive integer' },
  ],
  
  email: [
    { validator: validators.email, message: 'Invalid email format' },
  ],
  
  phone: [
    { validator: validators.required, message: 'Phone number is required' },
    { validator: validators.phone, message: 'Invalid phone number format' },
  ],
  
  expiryDate: [
    { validator: validators.required, message: 'Expiry date is required' },
    { validator: validators.date, message: 'Invalid date format' },
    { validator: validators.futureDate, message: 'Expiry date must be in the future' },
  ],
};

// Sanitize input to prevent XSS
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
};

// Sanitize entire object
export const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

// Format validation error messages
export const formatErrors = (errors) => {
  return Object.entries(errors).map(([field, message]) => ({
    field,
    message,
  }));
};

// Check if form has errors
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};