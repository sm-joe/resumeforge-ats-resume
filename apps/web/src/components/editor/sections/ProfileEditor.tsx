"use client";

import { useEditor } from "@/lib/editor/EditorProvider";
import { TextField } from "@/components/editor/fields/TextField";

const EMAIL_MAX_LENGTH = 254;
const PHONE_MAX_LENGTH = 15;

export function ProfileEditor() {
  const { state, dispatch } = useEditor();

  const { profile } = state.resume;

  function updateProfile(
    field:
      | "name"
      | "headline"
      | "email"
      | "phone"
      | "location",
    value: string,
  ) {
    dispatch({
      type: "resume/update",
      updater: (resume) => ({
        ...resume,
        profile: {
          ...resume.profile,
          [field]: value,
        },
      }),
    });
  }

  function updateEmail(value: string) {
    updateProfile(
      "email",
      value.slice(0, EMAIL_MAX_LENGTH),
    );
  }

  function updatePhone(value: string) {
    const sanitized = value
      .replace(/[^\d+().\-\s]/g, "")
      .slice(0, PHONE_MAX_LENGTH);

    updateProfile("phone", sanitized);
  }

  return (
    <section className="rf-section">
      <div className="rf-section-header">
        <div>
          <h3>Profile</h3>
          <p>
            Your core contact and professional identity.
          </p>
        </div>
      </div>

      <div className="rf-fields">
        <TextField
          label="Name"
          value={profile.name}
          onChange={(value) =>
            updateProfile("name", value)
          }
        />

        <TextField
          label="Headline"
          value={profile.headline ?? ""}
          onChange={(value) =>
            updateProfile("headline", value)
          }
        />

        <div className="rf-fields rf-fields-2">
          <TextField
            label="Email"
            type="email"
            value={profile.email ?? ""}
            onChange={updateEmail}
            maxLength={EMAIL_MAX_LENGTH}
          />

          <TextField
            label="Phone"
            type="tel"
            value={profile.phone ?? ""}
            onChange={updatePhone}
            maxLength={PHONE_MAX_LENGTH}
          />
        </div>

        <TextField
          label="Location"
          value={profile.location ?? ""}
          onChange={(value) =>
            updateProfile("location", value)
          }
        />
      </div>
    </section>
  );
}