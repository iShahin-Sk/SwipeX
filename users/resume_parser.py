import pdfplumber


def extract_resume_text(file_path):
    """
    Extract text from a PDF resume.
    """

    extracted_text = []

    try:
        with pdfplumber.open(file_path) as pdf:

            for page in pdf.pages:

                text = page.extract_text()

                if text:
                    extracted_text.append(text)

        return "\n".join(extracted_text).strip()

    except Exception as e:
        print("Resume parsing error:", e)
        return ""