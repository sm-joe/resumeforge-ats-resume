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

  function updateLink(
    index: number,
    field: "label" | "url",
    value: string,
  ) {
    dispatch({
      type: "resume/update",
      updater: (resume) => {
        const links = [...resume.profile.links];

        links[index] = {
          ...links[index],
          [field]: value,
        };

        return {
          ...resume,
          profile: {
            ...resume.profile,
            links,
          },
        };
      },
    });
  }

  function addLink() {
    dispatch({
      type: "resume/update",
      updater: (resume) => ({
        ...resume,
        profile: {
          ...resume.profile,
          links: [
            ...resume.profile.links,
            {
              label: "",
              url: "",
            },
          ],
        },
      }),
    });
  }

  function removeLink(index: number) {
    dispatch({
      type: "resume/update",
      updater: (resume) => ({
        ...resume,
        profile: {
          ...resume.profile,
          links: resume.profile.links.filter(
            (_, linkIndex) => linkIndex !== index,
          ),
        },
      }),
    });
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

        <div
          style={{
            display: "grid",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <div>
            <h4
              style={{
                margin: "0 0 4px",
                fontSize: "14px",
              }}
            >
              Professional Links
            </h4>

            <p
              style={{
                margin: 0,
                fontSize: "12px",
                color: "#66736f",
              }}
            >
              Add LinkedIn, GitHub, portfolio, or another
              professional profile.
            </p>
          </div>

          {profile.links.map((link, index) => (
            <div
              key={index}
              style={{
                display: "grid",
                gap: "8px",
                padding: "12px",
                border: "1px solid #d9dfdc",
                borderRadius: "8px",
                background: "#fafcfb",
              }}
            >
              <TextField
                label="Label"
                value={link.label ?? ""}
                onChange={(value) =>
                  updateLink(index, "label", value)
                }
                placeholder="LinkedIn"
              />

              <TextField
                label="URL"
                type="url"
                value={link.url ?? ""}
                onChange={(value) =>
                  updateLink(index, "url", value)
                }
                placeholder="https://linkedin.com/in/yourname"
              />

              <button
                type="button"
                onClick={() => removeLink(index)}
                style={{
                  justifySelf: "start",
                  border: "1px solid #d9dfdc",
                  borderRadius: "6px",
                  background: "#ffffff",
                  padding: "7px 10px",
                  color: "#34413c",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Remove link
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addLink}
            style={{
              justifySelf: "start",
              border: "1px solid #c9d2ce",
              borderRadius: "7px",
              background: "#ffffff",
              padding: "8px 12px",
              color: "#34413c",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            + Add professional link
          </button>
        </div>
      </div>
    </section>
  );
}