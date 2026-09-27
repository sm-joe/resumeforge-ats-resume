commit d2130a6f444a229e3bd24a9d192ccf85adeaf9fd
Author: sm_joe <sm_joe@rediffmail.com>
Date:   Sat Sep 26 23:50:35 2026 +0530

    fix: drag section order functionality restored

diff --git a/apps/web/src/components/resume/ResumeOverview.tsx b/apps/web/src/components/resume/ResumeOverview.tsx
index dcf24ce..35ab5c2 100644
--- a/apps/web/src/components/resume/ResumeOverview.tsx
+++ b/apps/web/src/components/resume/ResumeOverview.tsx
@@ -58,7 +58,12 @@ export function ResumeOverview({
         )}
 
         {contactItems.length > 0 && (
-          <div className="rf-preview-contact">
+          <div 
+            className="rf-preview-contact"
+            style={{
+              textAlign: "center",
+            }}
+          >
             {contactItems.join(" • ")}
           </div>
         )}
@@ -68,6 +73,7 @@ export function ResumeOverview({
             className="rf-preview-contact"
             style={{
               marginTop: "5px",
+              textAlign: "center",
             }}
           >
             {profile.links.map((link, index) => (
@@ -75,7 +81,14 @@ export function ResumeOverview({
                 key={`${link.label}-${index}`}
               >
                 {index > 0 ? " • " : ""}
-                {link.label}
+
+                <a
+                  href={link.url}
+                  target="_blank"
+                  rel="noopener noreferrer"
+                >
+                  {link.label || link.url}
+                </a>
               </span>
             ))}
           </div>
@@ -120,40 +133,36 @@ export function ResumeOverview({
                 marginBottom: "18px",
               }}
             >
-              <h4
+              <div
                 style={{
-                  margin: "0 0 4px",
-                  color: "#2d3734",
-                  fontSize: "14px",
-                  fontWeight: 700,
-                  letterSpacing: "-0.01em",
+                  display: "flex",
+                  alignItems: "baseline",
+                  justifyContent: "space-between",
+                  gap: "16px",
+                  marginBottom: "4px",
                 }}
               >
+                <h4
+                  style={{
+                    margin: 0,
+                    color: "#2d3734",
+                    fontSize: "14px",
+                    fontWeight: 700,
+                    letterSpacing: "-0.01em",
+                  }}
+                >
                 {experience.title}
               </h4>
 
-              <div
-                style={{
-                  color: "#66736f",
-                  fontSize: "12px",
-                  marginBottom: "7px",
-                }}
-              >
-                {experience.company}
-
-                {experience.location
-                  ? ` • ${experience.location}`
-                  : ""}
-              </div>
-
               {(experience.startDate ||
                 experience.endDate ||
                 experience.current) && (
                 <div
                   style={{
-                    marginBottom: "8px",
-                    color: "#7a8581",
-                    fontSize: "11px",
+                    flexShrink: 0,
+                    color: "#66736f",
+                    fontSize: "13px",
+                    whiteSpace: "nowrap",
                   }}
                 >
                   {experience.startDate}
@@ -161,10 +170,25 @@ export function ResumeOverview({
                   {experience.current
                     ? " – Present"
                     : experience.endDate
-                      ? ` – ${experience.endDate}`
-                      : ""}
+                    ? ` – ${experience.endDate}`
+                    : ""}
                 </div>
-              )}
+                )}
+              </div>
+                
+              <div
+                style={{
+                  color: "#66736f",
+                  fontSize: "13px",
+                  marginBottom: "8px",
+                }}
+              >
+                {experience.company}
+
+                {experience.location
+                  ? ` • ${experience.location}`
+                  : ""}
+              </div>
 
               {experience.bullets.length > 0 && (
                 <ul
@@ -229,7 +253,7 @@ export function ResumeOverview({
               <div
                 style={{
                   color: "#66736f",
-                  fontSize: "12px",
+                  fontSize: "13px",
                 }}
               >
                 {education.institution}
@@ -245,7 +269,7 @@ export function ResumeOverview({
                   style={{
                     marginTop: "3px",
                     color: "#7a8581",
-                    fontSize: "11px",
+                    fontSize: "13px",
                   }}
                 >
                   {education.startDate}
@@ -304,7 +328,7 @@ export function ResumeOverview({
                   style={{
                     marginBottom: "7px",
                     color: "#66736f",
-                    fontSize: "12px",
+                    fontSize: "13px",
                   }}
                 >
                   {project.technologies.join(
@@ -339,7 +363,7 @@ export function ResumeOverview({
                   style={{
                     marginTop: "6px",
                     color: "#52756b",
-                    fontSize: "11px",
+                    fontSize: "13px",
                   }}
                 >
                   {project.url}
