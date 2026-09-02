import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Heart,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { updateProfilePreferences, getTopMatches } from "../services/api";
import {
  SEXUAL_ORIENTATION_OPTIONS,
  RELATIONSHIP_STATUS_OPTIONS,
  ETHNICITY_OPTIONS,
  RELIGION_OPTIONS,
  EDUCATION_OPTIONS,
  BODY_TYPE_OPTIONS,
  YES_NO_OPTIONS,
  WANTS_CHILDREN_OPTIONS,
  DIET_OPTIONS,
  FREQUENCY_OPTIONS,
  PET_OPTIONS,
  LANGUAGE_OPTIONS,
  PREFERENCE_OPTIONS,
  CALGARY_COORDS,
} from "../constants/profileOptions";

const mapUserToFormData = (profile) => ({
  sexualOrientation: profile.sexualOrientation || "",
  relationshipStatus: profile.relationshipStatus || "",
  ethnicity: profile.ethnicity || "",
  religion: profile.religion || "",
  educationLevel: profile.educationLevel || "",
  preference: profile.preference || "EVERYONE",
  bodyType: profile.bodyType || "",
  hasChildren:
    profile.hasChildren !== undefined && profile.hasChildren !== null
      ? String(profile.hasChildren)
      : "",
  wantsChildren: profile.wantsChildren || "",
  diet: profile.diet || "",
  drinking: profile.drinking || "",
  smoking: profile.smoking || "",
  drugs: profile.drugs || "",
  pets: profile.pets || [],
  language: profile.language || "",
  city: profile.city || "Calgary",
  latitude:
    profile.latitude != null ? String(profile.latitude) : "",
  longitude:
    profile.longitude != null ? String(profile.longitude) : "",
  prefMinAge: profile.prefMinAge ? String(profile.prefMinAge) : "18",
  prefMaxAge: profile.prefMaxAge ? String(profile.prefMaxAge) : "50",
  prefMaxDistanceKm: profile.prefMaxDistanceKm
    ? String(profile.prefMaxDistanceKm)
    : "50",
});

const STEPS = ["Basics", "Lifestyle", "Location", "Preferences"];

const SelectField = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-gray-700 font-semibold mb-2 text-sm">
      {label} {required && <span className="text-pink-500">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 focus:border-transparent outline-none transition bg-white"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const OnboardingProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUser, loading: authLoading } = useAuth();
  const isEditMode =
    searchParams.get("edit") === "true" || Boolean(user?.profileComplete);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showNoMatchModal, setShowNoMatchModal] = useState(false);

  const [formData, setFormData] = useState({
    sexualOrientation: "",
    relationshipStatus: "",
    ethnicity: "",
    religion: "",
    educationLevel: "",
    preference: "EVERYONE",
    bodyType: "",
    hasChildren: "",
    wantsChildren: "",
    diet: "",
    drinking: "",
    smoking: "",
    drugs: "",
    pets: [],
    language: "",
    city: "Calgary",
    latitude: "",
    longitude: "",
    prefMinAge: "18",
    prefMaxAge: "50",
    prefMaxDistanceKm: "50",
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    setFormData(mapUserToFormData(user));
    setFormReady(true);
  }, [user, authLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePetToggle = (petValue) => {
    setFormData((prev) => {
      const pets = prev.pets.includes(petValue)
        ? prev.pets.filter((p) => p !== petValue)
        : [...prev.pets, petValue];
      return { ...prev, pets };
    });
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude.toString(),
          longitude: pos.coords.longitude.toString(),
        }));
        toast.success("Location captured!");
        setLocating(false);
      },
      () => {
        toast.error("Could not get location. Using Calgary defaults.");
        setFormData((prev) => ({
          ...prev,
          latitude: CALGARY_COORDS.latitude.toString(),
          longitude: CALGARY_COORDS.longitude.toString(),
        }));
        setLocating(false);
      },
    );
  };

  const geocodeCity = async () => {
    if (!formData.city) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formData.city + ", Canada")}&limit=1`,
        { headers: { "Accept-Language": "en" } },
      );
      const data = await res.json();
      if (data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          latitude: parseFloat(data[0].lat).toString(),
          longitude: parseFloat(data[0].lon).toString(),
        }));
        toast.success("City location found!");
      } else {
        setFormData((prev) => ({
          ...prev,
          latitude: CALGARY_COORDS.latitude.toString(),
          longitude: CALGARY_COORDS.longitude.toString(),
        }));
        toast("Using default Calgary coordinates");
      }
    } catch {
      setFormData((prev) => ({
        ...prev,
        latitude: CALGARY_COORDS.latitude.toString(),
        longitude: CALGARY_COORDS.longitude.toString(),
      }));
      toast("Using default Calgary coordinates");
    }
  };

  const validateStep = () => {
    if (step === 0) {
      const required = [
        "sexualOrientation",
        "relationshipStatus",
        "ethnicity",
        "religion",
        "educationLevel",
        "preference",
      ];
      for (const field of required) {
        if (!formData[field]) {
          toast.error("Please fill in all required fields");
          return false;
        }
      }
    }
    if (step === 2) {
      if (!formData.city || !formData.language) {
        toast.error("City and language are required");
        return false;
      }
      if (!formData.latitude || !formData.longitude) {
        toast.error("Please capture your location or geocode your city");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.prefMinAge || !formData.prefMaxAge || !formData.prefMaxDistanceKm) {
        toast.error("Please fill in all preference fields");
        return false;
      }
      if (parseInt(formData.prefMinAge) > parseInt(formData.prefMaxAge)) {
        toast.error("Min age must be less than or equal to max age");
        return false;
      }
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (step === 2 && (!formData.latitude || !formData.longitude)) {
      await geocodeCity();
    }
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    try {
      const payload = {
        sexualOrientation: formData.sexualOrientation,
        relationshipStatus: formData.relationshipStatus,
        ethnicity: formData.ethnicity,
        religion: formData.religion,
        educationLevel: formData.educationLevel,
        preference: formData.preference,
        language: formData.language,
        city: formData.city,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        prefMinAge: parseInt(formData.prefMinAge),
        prefMaxAge: parseInt(formData.prefMaxAge),
        prefMaxDistanceKm: parseInt(formData.prefMaxDistanceKm),
        pets: formData.pets,
      };

      if (formData.bodyType) payload.bodyType = formData.bodyType;
      if (formData.hasChildren !== "")
        payload.hasChildren = formData.hasChildren === "true";
      if (formData.wantsChildren) payload.wantsChildren = formData.wantsChildren;
      if (formData.diet) payload.diet = formData.diet;
      if (formData.drinking) payload.drinking = formData.drinking;
      if (formData.smoking) payload.smoking = formData.smoking;
      if (formData.drugs) payload.drugs = formData.drugs;

      const response = await updateProfilePreferences(payload);
      updateUser(response.data);
      toast.success(
        isEditMode
          ? "Profile updated successfully!"
          : "Profile complete! Finding your matches...",
      );

      if (isEditMode) {
        navigate("/profile");
        return;
      }

      try {
        const topRes = await getTopMatches(1);
        if (topRes.data?.length > 0) {
          navigate("/match-found", { state: { match: topRes.data[0] } });
          return;
        }
      } catch {
        // Fall through to no-match modal if top matches unavailable
      }

      setShowNoMatchModal(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to save profile. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !user || !formReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-pink-50 px-4 py-28">
      <Toaster />

      {showNoMatchModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <motion.div
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Heart className="text-pink-500" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              No Perfect Match Yet
            </h2>
            <p className="text-gray-600 mb-6">
              We could not find your perfect match right now. You can still
              explore other profiles and connect with people nearby.
            </p>
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold hover:from-pink-700 hover:to-purple-700 transition"
            >
              Click here to Explore Matches
            </button>
          </motion.div>
        </div>
      )}
      <motion.div
        className="w-full max-w-2xl bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-pink-100"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4">
            <Heart className="text-white" size={32} fill="white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {isEditMode ? "Edit Your Profile" : "Complete Your Profile"}
          </h2>
          <p className="text-gray-600 text-sm mt-2">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= step ? "bg-pink-500 w-8" : "bg-gray-200 w-4"
                }`}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {step === 0 && (
              <>
                <SelectField
                  label="Sexual orientation"
                  name="sexualOrientation"
                  value={formData.sexualOrientation}
                  onChange={handleChange}
                  options={SEXUAL_ORIENTATION_OPTIONS}
                  required
                />
                <SelectField
                  label="Relationship status"
                  name="relationshipStatus"
                  value={formData.relationshipStatus}
                  onChange={handleChange}
                  options={RELATIONSHIP_STATUS_OPTIONS}
                  required
                />
                <SelectField
                  label="Ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleChange}
                  options={ETHNICITY_OPTIONS}
                  required
                />
                <SelectField
                  label="Religion"
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                  options={RELIGION_OPTIONS}
                  required
                />
                <SelectField
                  label="Education level"
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  options={EDUCATION_OPTIONS}
                  required
                />
                <SelectField
                  label="Looking for"
                  name="preference"
                  value={formData.preference}
                  onChange={handleChange}
                  options={PREFERENCE_OPTIONS}
                  required
                />
              </>
            )}

            {step === 1 && (
              <>
                <SelectField
                  label="Body type"
                  name="bodyType"
                  value={formData.bodyType}
                  onChange={handleChange}
                  options={BODY_TYPE_OPTIONS}
                />
                <SelectField
                  label="Has children"
                  name="hasChildren"
                  value={formData.hasChildren}
                  onChange={handleChange}
                  options={YES_NO_OPTIONS}
                />
                <SelectField
                  label="Wants children"
                  name="wantsChildren"
                  value={formData.wantsChildren}
                  onChange={handleChange}
                  options={WANTS_CHILDREN_OPTIONS}
                />
                <SelectField
                  label="Diet"
                  name="diet"
                  value={formData.diet}
                  onChange={handleChange}
                  options={DIET_OPTIONS}
                />
                <SelectField
                  label="Drinking"
                  name="drinking"
                  value={formData.drinking}
                  onChange={handleChange}
                  options={FREQUENCY_OPTIONS}
                />
                <SelectField
                  label="Smoking"
                  name="smoking"
                  value={formData.smoking}
                  onChange={handleChange}
                  options={FREQUENCY_OPTIONS}
                />
                <SelectField
                  label="Drugs"
                  name="drugs"
                  value={formData.drugs}
                  onChange={handleChange}
                  options={FREQUENCY_OPTIONS}
                />
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Pets
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PET_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handlePetToggle(opt.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                          formData.pets.includes(opt.value)
                            ? "bg-pink-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <SelectField
                  label="Primary language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  options={LANGUAGE_OPTIONS}
                  required
                />
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    City <span className="text-pink-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin
                      className="absolute left-4 top-3.5 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 outline-none"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    disabled={locating}
                    className="flex-1 py-3 rounded-xl border border-pink-300 text-pink-600 font-semibold flex items-center justify-center gap-2 hover:bg-pink-50 transition disabled:opacity-50"
                  >
                    <Navigation size={18} />
                    {locating ? "Getting location..." : "Use my location"}
                  </button>
                  <button
                    type="button"
                    onClick={geocodeCity}
                    className="flex-1 py-3 rounded-xl border border-purple-300 text-purple-600 font-semibold flex items-center justify-center gap-2 hover:bg-purple-50 transition"
                  >
                    <MapPin size={18} />
                    Geocode city
                  </button>
                </div>
                {formData.latitude && formData.longitude && (
                  <p className="text-sm text-green-600 text-center">
                    Location set: {parseFloat(formData.latitude).toFixed(4)},{" "}
                    {parseFloat(formData.longitude).toFixed(4)}
                  </p>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Min age <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="prefMinAge"
                      min="18"
                      max="120"
                      value={formData.prefMinAge}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">
                      Max age <span className="text-pink-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="prefMaxAge"
                      min="18"
                      max="120"
                      value={formData.prefMaxAge}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm">
                    Max distance (km) <span className="text-pink-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="prefMaxDistanceKm"
                    min="1"
                    max="500"
                    value={formData.prefMaxDistanceKm}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-600 outline-none"
                    required
                  />
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3 rounded-xl border font-semibold flex items-center justify-center gap-2 hover:bg-gray-50"
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold flex items-center justify-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold disabled:opacity-50"
            >
              {isLoading ? "Saving..." : isEditMode ? "Save Profile" : "Complete Profile"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingProfile;
