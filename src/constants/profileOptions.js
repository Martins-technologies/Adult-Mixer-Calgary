export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Non-binary" },
];

export const PREFERENCE_OPTIONS = [
  { value: "MALE", label: "Men" },
  { value: "FEMALE", label: "Women" },
  { value: "EVERYONE", label: "Everyone" },
];

export const SEXUAL_ORIENTATION_OPTIONS = [
  { value: "STRAIGHT", label: "Straight" },
  { value: "GAY", label: "Gay" },
  { value: "BISEXUAL", label: "Bisexual" },
];

export const RELATIONSHIP_STATUS_OPTIONS = [
  { value: "SINGLE", label: "Single" },
  { value: "DIVORCED", label: "Divorced" },
  { value: "WIDOWED", label: "Widowed" },
];

export const ETHNICITY_OPTIONS = [
  { value: "WHITE", label: "White" },
  { value: "BLACK", label: "Black" },
  { value: "ASIAN", label: "Asian" },
  { value: "SOUTH_ASIAN", label: "South Asian" },
  { value: "HISPANIC", label: "Hispanic" },
  { value: "MIDDLE_EASTERN", label: "Middle Eastern" },
  { value: "MIXED", label: "Mixed" },
  { value: "OTHER", label: "Other" },
];

export const RELIGION_OPTIONS = [
  { value: "CHRISTIANITY", label: "Christianity" },
  { value: "ISLAM", label: "Islam" },
  { value: "HINDUISM", label: "Hinduism" },
  { value: "JUDAISM", label: "Judaism" },
  { value: "BUDDHISM", label: "Buddhism" },
  { value: "ATHEIST", label: "Atheist" },
  { value: "AGNOSTIC", label: "Agnostic" },
  { value: "OTHER", label: "Other" },
  { value: "PREFER_NOT_TO_SAY", label: "Prefer not to say" },
];

export const EDUCATION_OPTIONS = [
  { value: "HIGH_SCHOOL", label: "High school" },
  { value: "SOME_COLLEGE", label: "Some college" },
  { value: "UNDERGRADUATE", label: "Undergraduate" },
  { value: "POSTGRADUATE", label: "Postgraduate" },
];

export const BODY_TYPE_OPTIONS = [
  { value: "SLIM", label: "Slim" },
  { value: "ATHLETIC", label: "Athletic" },
  { value: "AVERAGE", label: "Average" },
  { value: "CURVY", label: "Curvy" },
  { value: "PLUS_SIZE", label: "Plus size" },
];

export const YES_NO_OPTIONS = [
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const WANTS_CHILDREN_OPTIONS = [
  { value: "WANTS", label: "Wants" },
  { value: "DOESNT_WANT", label: "Doesn't want" },
  { value: "OPEN", label: "Open" },
];

export const DIET_OPTIONS = [
  { value: "ANYTHING", label: "Anything" },
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "VEGAN", label: "Vegan" },
  { value: "HALAL", label: "Halal" },
  { value: "KOSHER", label: "Kosher" },
  { value: "OTHER", label: "Other" },
];

export const FREQUENCY_OPTIONS = [
  { value: "NEVER", label: "Never" },
  { value: "RARELY", label: "Rarely" },
  { value: "SOMETIMES", label: "Sometimes" },
  { value: "REGULARLY", label: "Regularly" },
];

export const PET_OPTIONS = [
  { value: "HAS_CATS", label: "Has cats" },
  { value: "HAS_DOGS", label: "Has dogs" },
  { value: "OTHER", label: "Other" },
  { value: "NONE", label: "None" },
];

export const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
  { value: "Spanish", label: "Spanish" },
  { value: "Mandarin", label: "Mandarin" },
  { value: "Hindi", label: "Hindi" },
  { value: "Arabic", label: "Arabic" },
  { value: "Punjabi", label: "Punjabi" },
  { value: "Tagalog", label: "Tagalog" },
  { value: "Other", label: "Other" },
];

export const ANY_PREF_OPTIONS = [
  { value: "", label: "Any" },
  ...ETHNICITY_OPTIONS,
];

export const ANY_RELIGION_PREF_OPTIONS = [
  { value: "", label: "Any" },
  ...RELIGION_OPTIONS,
];

export const ANY_EDUCATION_PREF_OPTIONS = [
  { value: "", label: "Any" },
  ...EDUCATION_OPTIONS,
];

export const ANY_LANGUAGE_PREF_OPTIONS = [
  { value: "", label: "Any" },
  ...LANGUAGE_OPTIONS,
];

export const CALGARY_COORDS = { latitude: 51.0447, longitude: -114.0719 };

export const formatEnumLabel = (value) => {
  if (!value) return "";
  return value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
};

export const getLabel = (options, value) => {
  const found = options.find((o) => o.value === value);
  return found ? found.label : formatEnumLabel(value);
};
