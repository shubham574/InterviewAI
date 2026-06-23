import { useEffect } from 'react';

const SEOHead = ({ title, description }) => {
  useEffect(() => {
    // Set Document Title
    const baseTitle = 'InterviewAce AI';
    document.title = title ? `${title} | ${baseTitle}` : baseTitle;

    // Set Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        metaDescription.content = description;
        document.head.appendChild(metaDescription);
      }
    }
  }, [title, description]);

  return null; // This component doesn't render anything
};

export default SEOHead;
