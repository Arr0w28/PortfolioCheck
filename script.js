// Portfolio Data Loader and Renderer
class PortfolioRenderer {
    constructor() {
        this.data = null;
        this.init();
    }

    async init() {
        try {
            await this.loadResumeData();
            this.renderPortfolio();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading portfolio:', error);
            this.showError();
        }
    }

    async loadResumeData() {
        try {
            const response = await fetch('./data/resume.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Failed to load resume data:', error);
            throw error;
        }
    }

    renderPortfolio() {
        if (!this.data) {
            throw new Error('No resume data available');
        }

        this.renderHeader();
        this.renderSummary();
        this.renderExperience();
        this.renderEducation();
        this.renderSkills();
        this.renderProjects();
        this.renderCertifications();
        this.renderLanguages();
        this.renderFooter();
    }

    renderHeader() {
        const personalInfo = this.data.personal_info || {};
        
        // Update page title
        document.getElementById('page-title').textContent = 
            `${personalInfo.name || 'Portfolio'} - Professional Portfolio`;
        
        // Update name
        document.getElementById('name').textContent = 
            personalInfo.name || 'Your Name';
        
        // Update title (try to extract from experience or use default)
        const title = this.extractJobTitle() || 'Professional';
        document.getElementById('title').textContent = title;
        
        // Update profile image (you can customize this)
        const profileImg = document.getElementById('profile-img');
        if (personalInfo.image) {
            profileImg.innerHTML = `<img src="${personalInfo.image}" alt="${personalInfo.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;">`;
        } else {
            // Generate initials from name
            const initials = this.getInitials(personalInfo.name || 'Your Name');
            profileImg.innerHTML = `<span style="font-size: 3rem; font-weight: 600;">${initials}</span>`;
        }

        // Render contact info
        this.renderContactInfo(personalInfo);
    }

    extractJobTitle() {
        const experience = this.data.experience || [];
        if (experience.length > 0) {
            return experience[0].title || '';
        }
        return null;
    }

    getInitials(name) {
        return name.split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    renderContactInfo(personalInfo) {
        const contactContainer = document.getElementById('contact-info');
        const contactItems = [];

        if (personalInfo.email) {
            contactItems.push({
                icon: 'fas fa-envelope',
                text: personalInfo.email,
                link: `mailto:${personalInfo.email}`
            });
        }

        if (personalInfo.phone) {
            contactItems.push({
                icon: 'fas fa-phone',
                text: personalInfo.phone,
                link: `tel:${personalInfo.phone}`
            });
        }

        if (personalInfo.linkedin) {
            contactItems.push({
                icon: 'fab fa-linkedin',
                text: 'LinkedIn',
                link: personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`
            });
        }

        if (personalInfo.github) {
            contactItems.push({
                icon: 'fab fa-github',
                text: 'GitHub',
                link: personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`
            });
        }

        if (personalInfo.location) {
            contactItems.push({
                icon: 'fas fa-map-marker-alt',
                text: personalInfo.location,
                link: null
            });
        }

        contactContainer.innerHTML = contactItems.map(item => `
            <div class="contact-item">
                <i class="${item.icon}"></i>
                ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">${item.text}</a>` : `<span>${item.text}</span>`}
            </div>
        `).join('');
    }

    renderSummary() {
        const summaryElement = document.getElementById('summary');
        const summary = this.data.summary || 'No summary available.';
        summaryElement.textContent = summary;
    }

    renderExperience() {
        const experienceList = document.getElementById('experience-list');
        const experience = this.data.experience || [];

        if (experience.length === 0) {
            experienceList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No experience information available.</p>';
            return;
        }

        experienceList.innerHTML = experience.map(exp => `
            <div class="experience-item">
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${exp.title || 'Position Title'}</h3>
                        <p class="item-company">${exp.company || 'Company Name'}</p>
                    </div>
                    ${exp.dates ? `<span class="item-dates">${exp.dates}</span>` : ''}
                </div>
                <div class="item-description">
                    ${exp.description ? this.formatDescription(exp.description) : ''}
                </div>
            </div>
        `).join('');
    }

    renderEducation() {
        const educationList = document.getElementById('education-list');
        const education = this.data.education || [];

        if (education.length === 0) {
            educationList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No education information available.</p>';
            return;
        }

        educationList.innerHTML = education.map(edu => `
            <div class="education-item">
                <div class="item-header">
                    <div>
                        <h3 class="item-title">${edu.degree || 'Degree'}</h3>
                        <p class="item-institution">${edu.institution || 'Institution'}</p>
                    </div>
                    ${edu.year ? `<span class="item-dates">${edu.year}</span>` : ''}
                </div>
                ${edu.gpa ? `<div class="item-description"><strong>GPA:</strong> ${edu.gpa}</div>` : ''}
            </div>
        `).join('');
    }

    renderSkills() {
        const skillsGrid = document.getElementById('skills-grid');
        const skills = this.data.skills || [];

        if (skills.length === 0) {
            skillsGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No skills information available.</p>';
            return;
        }

        // Group skills by category (simple heuristic)
        const skillCategories = this.categorizeSkills(skills);
        
        skillsGrid.innerHTML = Object.entries(skillCategories).map(([category, skills]) => `
            <div class="skill-category">
                <h3>${category}</h3>
                <div class="skill-tags">
                    ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                </div>
            </div>
        `).join('');
    }

    categorizeSkills(skills) {
        const categories = {
            'Programming Languages': [],
            'Frameworks & Libraries': [],
            'Tools & Technologies': [],
            'Other Skills': []
        };

        const programmingKeywords = ['python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin', 'typescript'];
        const frameworkKeywords = ['react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring', 'laravel', 'rails', 'next', 'nuxt'];

        skills.forEach(skill => {
            const skillLower = skill.toLowerCase();
            
            if (programmingKeywords.some(keyword => skillLower.includes(keyword))) {
                categories['Programming Languages'].push(skill);
            } else if (frameworkKeywords.some(keyword => skillLower.includes(keyword))) {
                categories['Frameworks & Libraries'].push(skill);
            } else if (skillLower.includes('git') || skillLower.includes('docker') || skillLower.includes('aws') || skillLower.includes('sql') || skillLower.includes('mongodb')) {
                categories['Tools & Technologies'].push(skill);
            } else {
                categories['Other Skills'].push(skill);
            }
        });

        // Remove empty categories
        Object.keys(categories).forEach(category => {
            if (categories[category].length === 0) {
                delete categories[category];
            }
        });

        return categories;
    }

    renderProjects() {
        const projectsGrid = document.getElementById('projects-grid');
        const projects = this.data.projects || [];

        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No projects information available.</p>';
            return;
        }

        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-item">
                <div class="item-header">
                    <h3 class="item-title">${project.name || 'Project Name'}</h3>
                </div>
                <div class="item-description">
                    ${project.description ? this.formatDescription(project.description) : 'No description available.'}
                </div>
                ${project.technologies ? `<div style="margin-top: 15px;"><strong>Technologies:</strong> ${project.technologies}</div>` : ''}
            </div>
        `).join('');
    }

    renderCertifications() {
        const certificationsList = document.getElementById('certifications-list');
        const certifications = this.data.certifications || [];

        if (certifications.length === 0) {
            certificationsList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No certifications available.</p>';
            return;
        }

        certificationsList.innerHTML = certifications.map(cert => `
            <div class="certification-item">
                <i class="fas fa-certificate"></i>
                <p>${cert}</p>
            </div>
        `).join('');
    }

    renderLanguages() {
        const languagesList = document.getElementById('languages-list');
        const languages = this.data.languages || [];

        if (languages.length === 0) {
            languagesList.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">No languages information available.</p>';
            return;
        }

        languagesList.innerHTML = languages.map(lang => `
            <div class="language-item">
                <i class="fas fa-language"></i>
                <span>${lang}</span>
            </div>
        `).join('');
    }

    renderFooter() {
        const currentYear = new Date().getFullYear();
        const personalInfo = this.data.personal_info || {};
        
        document.getElementById('current-year').textContent = currentYear;
        document.getElementById('footer-name').textContent = personalInfo.name || 'Your Name';
        
        const lastUpdated = this.data.last_updated ? 
            new Date(this.data.last_updated).toLocaleDateString() : 
            new Date().toLocaleDateString();
        document.getElementById('last-updated').textContent = lastUpdated;
    }

    formatDescription(description) {
        if (typeof description === 'string') {
            return description;
        } else if (Array.isArray(description)) {
            return `<ul>${description.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }
        return description;
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('portfolio-content').style.display = 'block';
    }

    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

// Initialize the portfolio when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioRenderer();
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (header) {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            header.style.transform = `translateY(${parallax}px)`;
        }
    });
});