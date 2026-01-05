# Risk Management & Strategic Pivot Walkthrough

## 1. Overview
Implemented the "Risk Management & Strategic Pivot" plan to minimize legal liability and reposition the platform as a "Research Prototype."

## 2. Changes

### Backend
- **Schema**: Replaced `Certification` model (file uploads) with `TeacherLicense` model (text-based).
- **API**: Added `POST /users/teacher/license`, removed certification endpoints.
- **Controller**: Cleaned up legacy code and resolved duplicate imports.

### Frontend
- **TeacherProfileForm**: 
    - Added "Licenses" section.
    - Added Disclaimer ("Edupin does not verify...").
    - Restored "Links" section.
- **ProfilePage**: Removed legacy file upload UI and fixed syntax errors.
- **useProfile**: Updated method signatures to support new fields.

## 3. Status
- All compilation errors resolved.
- Database migrated (`risk_management_pivot`).
- Ready for testing.
