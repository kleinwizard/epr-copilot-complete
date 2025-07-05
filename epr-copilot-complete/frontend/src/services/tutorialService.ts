import Shepherd from 'shepherd.js';
import 'shepherd.js/dist/css/shepherd.css';

export class TutorialService {
  private tour: Shepherd.Tour;
  private isFirstTimeUser: boolean = false;

  constructor() {
    this.tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: 'shadow-md bg-purple-dark',
        scrollTo: true,
        cancelIcon: {
          enabled: true,
        },
        buttons: [
          {
            text: 'Skip Tour',
            classes: 'btn btn-secondary',
            action: () => {
              this.tour.cancel();
              this.markTutorialCompleted();
            }
          },
          {
            text: 'Next',
            classes: 'btn btn-primary',
            action: () => this.tour.next()
          }
        ]
      }
    });

    this.setupTutorialSteps();
  }

  private setupTutorialSteps() {
    this.tour.addStep({
      id: 'welcome',
      title: 'Welcome to EPR Compliance Hub!',
      text: 'Welcome to the EPR Compliance Hub! Let\'s take a 2-minute tour to get you set up for success.',
      attachTo: {
        element: 'body',
        on: 'center'
      },
      buttons: [
        {
          text: 'Skip Tour',
          classes: 'btn btn-secondary',
          action: () => {
            this.tour.cancel();
            this.markTutorialCompleted();
          }
        },
        {
          text: 'Next',
          classes: 'btn btn-primary',
          action: () => {
            this.navigateToCompanySetup();
            this.tour.next();
          }
        }
      ]
    });

    this.tour.addStep({
      id: 'company-setup-form',
      title: 'Company Setup',
      text: 'First things first. Fill out your company\'s profile here. Accurate information is key for valid reporting.',
      attachTo: {
        element: '[data-tutorial="company-form"]',
        on: 'right'
      },
      when: {
        show: () => {
          if (window.location.pathname !== '/company-setup') {
            this.navigateToCompanySetup();
          }
        }
      }
    });

    this.tour.addStep({
      id: 'company-setup-documents',
      title: 'Document Verification',
      text: 'Upload your verification documents in this section to get your account fully verified and unlock all reporting features.',
      attachTo: {
        element: '[data-tutorial="documents-section"]',
        on: 'left'
      }
    });

    this.tour.addStep({
      id: 'materials-add-button',
      title: 'Materials Library',
      text: 'Next, build your Materials Library. This is where you\'ll define all the packaging materials you use. Let\'s look at the \'Add Material\' form.',
      attachTo: {
        element: '[data-tutorial="add-material-button"]',
        on: 'bottom'
      },
      when: {
        show: () => {
          if (window.location.pathname !== '/materials') {
            this.navigateToMaterials();
          }
        }
      },
      buttons: [
        {
          text: 'Skip Tour',
          classes: 'btn btn-secondary',
          action: () => {
            this.tour.cancel();
            this.markTutorialCompleted();
          }
        },
        {
          text: 'Next',
          classes: 'btn btn-primary',
          action: () => {
            this.navigateToAddMaterial();
            this.tour.next();
          }
        }
      ]
    });

    this.tour.addStep({
      id: 'material-user-info',
      title: 'Simple Material Entry',
      text: 'You only need to provide basic information you already know, like the material name and type. The system calculates the complex compliance data for you.',
      attachTo: {
        element: '[data-tutorial="user-provided-info"]',
        on: 'right'
      },
      when: {
        show: () => {
          if (!window.location.pathname.includes('/materials/add')) {
            this.navigateToAddMaterial();
          }
        }
      }
    });

    this.tour.addStep({
      id: 'products-add-button',
      title: 'Product Catalog',
      text: 'Now, create your Product Catalog. Here you will define your products and link them to the materials you just created.',
      attachTo: {
        element: '[data-tutorial="add-product-button"]',
        on: 'bottom'
      },
      when: {
        show: () => {
          if (window.location.pathname !== '/products') {
            this.navigateToProducts();
          }
        }
      },
      buttons: [
        {
          text: 'Skip Tour',
          classes: 'btn btn-secondary',
          action: () => {
            this.tour.cancel();
            this.markTutorialCompleted();
          }
        },
        {
          text: 'Next',
          classes: 'btn btn-primary',
          action: () => {
            this.navigateToAddProduct();
            this.tour.next();
          }
        }
      ]
    });

    this.tour.addStep({
      id: 'designated-producer-field',
      title: 'Designated Producer Assignment',
      text: 'It\'s important to assign the correct legal entity responsible for the fees for each product here.',
      attachTo: {
        element: '[data-tutorial="designated-producer"]',
        on: 'left'
      },
      when: {
        show: () => {
          if (!window.location.pathname.includes('/products/add')) {
            this.navigateToAddProduct();
          }
        }
      }
    });

    this.tour.addStep({
      id: 'analytics-dashboard',
      title: 'Analytics Dashboard',
      text: 'This is your Analytics dashboard. Once you add sales data, this page will give you a complete visual overview of your EPR obligations and costs.',
      attachTo: {
        element: '[data-tutorial="analytics-widgets"]',
        on: 'bottom'
      },
      when: {
        show: () => {
          if (window.location.pathname !== '/analytics') {
            this.navigateToAnalytics();
          }
        }
      }
    });

    this.tour.addStep({
      id: 'analytics-projections',
      title: 'Future Planning Tools',
      text: 'This powerful section helps you plan for the future. Use these tools to find cost savings, analyze compliance risks, and model growth scenarios.',
      attachTo: {
        element: '[data-tutorial="projections-section"]',
        on: 'top'
      }
    });

    this.tour.addStep({
      id: 'analytics-goals',
      title: 'Goal Tracking',
      text: 'Set financial goals for your EPR program here and track your progress throughout the year.',
      attachTo: {
        element: '[data-tutorial="compliance-goals"]',
        on: 'top'
      }
    });

    this.tour.addStep({
      id: 'reports-builder',
      title: 'Custom Reports',
      text: 'The Report Builder allows you to create customized reports for internal analysis or specific needs.',
      attachTo: {
        element: '[data-tutorial="report-builder"]',
        on: 'bottom'
      },
      when: {
        show: () => {
          if (window.location.pathname !== '/reports') {
            this.navigateToReports();
          }
        }
      }
    });

    this.tour.addStep({
      id: 'reports-export',
      title: 'Official Compliance Reports',
      text: 'The Export Center is where you\'ll generate and download the official compliance reports in various formats (PDF, CSV, XML) for submission to government agencies.',
      attachTo: {
        element: '[data-tutorial="export-center"]',
        on: 'bottom'
      }
    });

    this.tour.addStep({
      id: 'support-nav',
      title: 'Help & Support',
      text: 'If you ever need help, the Support page contains detailed guides, Q&A, and our contact information.',
      attachTo: {
        element: '[data-tutorial="support-nav"]',
        on: 'right'
      }
    });

    this.tour.addStep({
      id: 'tour-complete',
      title: 'Tour Complete!',
      text: 'You\'re all set! You\'ve completed the tour. Click \'Finish\' to start exploring on your own.',
      attachTo: {
        element: 'body',
        on: 'center'
      },
      buttons: [
        {
          text: 'Finish',
          classes: 'btn btn-primary',
          action: () => {
            this.tour.complete();
            this.markTutorialCompleted();
          }
        }
      ]
    });
  }

  public async checkAndStartTutorial(): Promise<void> {
    const hasCompletedTutorial = localStorage.getItem('epr-tutorial-completed');
    
    if (!hasCompletedTutorial) {
      this.isFirstTimeUser = true;
      setTimeout(() => {
        this.startTutorial();
      }, 1000);
    }
  }

  public startTutorial(): void {
    this.tour.start();
  }

  private markTutorialCompleted(): void {
    localStorage.setItem('epr-tutorial-completed', 'true');
    localStorage.setItem('epr-tutorial-completed-date', new Date().toISOString());
  }

  private navigateToCompanySetup(): void {
    if (window.location.pathname !== '/company-setup') {
      window.history.pushState({}, '', '/company-setup');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private navigateToMaterials(): void {
    if (window.location.pathname !== '/materials') {
      window.history.pushState({}, '', '/materials');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private navigateToAddMaterial(): void {
    if (!window.location.pathname.includes('/materials/add')) {
      window.history.pushState({}, '', '/materials/add');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private navigateToProducts(): void {
    if (window.location.pathname !== '/products') {
      window.history.pushState({}, '', '/products');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private navigateToAddProduct(): void {
    if (!window.location.pathname.includes('/products/add')) {
      window.history.pushState({}, '', '/products/add');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private navigateToAnalytics(): void {
    if (window.location.pathname !== '/analytics') {
      window.history.pushState({}, '', '/analytics');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  private navigateToReports(): void {
    if (window.location.pathname !== '/reports') {
      window.history.pushState({}, '', '/reports');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  }

  public resetTutorial(): void {
    localStorage.removeItem('epr-tutorial-completed');
    localStorage.removeItem('epr-tutorial-completed-date');
  }
}

export const tutorialService = new TutorialService();
