// Validation utility functions for form validation

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation regex (supports various formats)
const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

// Validation functions
export const validation = {
  // Check if field is required and not empty
  required: (value) => {
    return value && value.trim().length > 0;
  },

  // Validate email format
  email: (value) => {
    if (!value) return true; // Allow empty if not required
    return EMAIL_REGEX.test(value);
  },

  // Validate phone format
  phone: (value) => {
    if (!value) return true; // Allow empty if not required
    return PHONE_REGEX.test(value.replace(/[\s\-()]/g, ''));
  },

  // Validate minimum length
  minLength: (value, min) => {
    return value && value.length >= min;
  },

  // Validate maximum length
  maxLength: (value, max) => {
    return !value || value.length <= max;
  },

  // Validate name (letters and spaces only)
  name: (value) => {
    if (!value) return true;
    return /^[a-zA-Z\s]+$/.test(value);
  }
,
  // Validate date of birth (not in the future)
  dob: (value) => {
    if (!value) return true;
    const d = new Date(value);
    if (isNaN(d.getTime())) return false;
    const today = new Date();
    // Compare only date portion
    d.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    return d <= today;
  },

  // Validate gender (if provided, must be one of allowed)
  gender: (value) => {
    if (!value) return true;
    const allowed = ['Male', 'Female', 'Other'];
    return allowed.includes(value);
  },

  // Validate city (letters, spaces, commas allowed)
  city: (value) => {
    if (!value) return true;
    return /^[a-zA-Z\s,.'-]{1,100}$/.test(value);
  }
};

// Form validation rules for student form
export const studentValidationRules = {
  name: [
    { rule: validation.required, message: 'Name is required' },
    { rule: (value) => validation.minLength(value, 2), message: 'Name must be at least 2 characters' },
    { rule: (value) => validation.maxLength(value, 100), message: 'Name must be less than 100 characters' },
    { rule: validation.name, message: 'Name can only contain letters and spaces' }
  ],
  email: [
    { rule: validation.required, message: 'Email is required' },
    { rule: validation.email, message: 'Please enter a valid email address' },
    { rule: (value) => validation.maxLength(value, 100), message: 'Email must be less than 100 characters' }
  ],
  phone: [
    { rule: validation.required, message: 'Phone number is required' },
    { rule: validation.phone, message: 'Please enter a valid phone number' },
    { rule: (value) => validation.minLength(value, 10), message: 'Phone number must be at least 10 digits' },
    { rule: (value) => validation.maxLength(value, 15), message: 'Phone number must be less than 15 digits' }
  ],
  course: [
    { rule: validation.required, message: 'Course is required' },
    { rule: (value) => validation.minLength(value, 2), message: 'Course must be at least 2 characters' },
    { rule: (value) => validation.maxLength(value, 50), message: 'Course must be less than 50 characters' }
  ]
  ,
  gender: [
    { rule: validation.gender, message: 'Invalid gender selected' }
  ],
  dob: [
    { rule: validation.dob, message: 'Invalid date of birth or date is in the future' }
  ],
  city: [
    { rule: (value) => validation.maxLength(value, 100), message: 'City must be less than 100 characters' },
    { rule: validation.city, message: 'City contains invalid characters' }
  ]
};

// Validate form data against rules
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const fieldRules = rules[field];
    const value = data[field];
    
    for (const rule of fieldRules) {
      if (!rule.rule(value)) {
        errors[field] = rule.message;
        break;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
