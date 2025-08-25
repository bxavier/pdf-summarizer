import { SubSection, Section } from '../models';

// Single responsibility: Detect hierarchical sections in text with configurable patterns
export class SectionDetector {
  private readonly sectionPattern: RegExp;
  private readonly subSectionPattern: RegExp;

  constructor(sectionKeyword = 'Unit', subSectionKeyword = 'Lesson') {
    this.sectionPattern = new RegExp(`^${sectionKeyword}\\s+(\\d+)`, 'i');
    this.subSectionPattern = new RegExp(`^${subSectionKeyword}\\s+(\\d+)`, 'i');
  }

  detectSections(text: string): Section[] {
    const lines = text.split('\n');
    const sections: Section[] = [];
    let currentSection: Section | null = null;
    let currentSubSection: SubSection | null = null;
    let currentContent: string[] = [];

    for (const line of lines) {
      const sectionMatch = line.match(this.sectionPattern);
      const subSectionMatch = line.match(this.subSectionPattern);

      if (sectionMatch) {
        // Save previous subsection if exists
        this.saveCurrentSubSection(currentSubSection, currentContent, currentSection);

        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }

        // Start new section
        currentSection = {
          number: parseInt(sectionMatch[1]),
          title: line.trim(),
          subSections: [],
        };
        currentSubSection = null;
        currentContent = [];
      } else if (subSectionMatch && currentSection) {
        // Save previous subsection if exists
        this.saveCurrentSubSection(currentSubSection, currentContent, currentSection);

        // Start new subsection
        currentSubSection = {
          number: parseInt(subSectionMatch[1]),
          title: line.trim(),
          content: '',
        };
        currentContent = [];
      } else if (currentSubSection) {
        // Add content to current subsection
        currentContent.push(line);
      }
    }

    // Don't forget the last subsection and section
    this.saveCurrentSubSection(currentSubSection, currentContent, currentSection);
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  }

  private saveCurrentSubSection(subSection: SubSection | null, content: string[], section: Section | null): void {
    if (subSection && section) {
      subSection.content = content.join('\n').trim();
      section.subSections.push(subSection);
    }
  }
}
