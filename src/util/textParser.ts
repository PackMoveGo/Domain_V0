export interface Section {
  title: string;
  content: string;
}

export function parseAboutText(text: string): Section[] {
  const sections: Section[] = [];
  const lines = text.split('\n');
  let currentSection: Section | null = null;

  lines.forEach(line => {
    if (line.startsWith('##')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace('##', '').trim(),
        content: ''
      };
    } else if (currentSection && line.trim()) {
      currentSection.content += line + '\n';
    }
  });

  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
} 