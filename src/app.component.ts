
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { GeminiService } from './services/gemini.service';
import { AnalysisReport } from './models';
import { SentimentChartComponent } from './components/sentiment-chart/sentiment-chart.component';
import { WordCloudComponent } from './components/word-cloud/word-cloud.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SentimentChartComponent, WordCloudComponent],
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private geminiService = inject(GeminiService);

  reviewsText = signal(`
The battery life on this new phone is amazing! Lasts two full days.
I'm very disappointed with the camera quality, pictures are blurry.
Customer service was incredibly helpful and resolved my issue in minutes.
The app keeps crashing after the latest update, it's unusable.
Shipping was much faster than expected, which was a pleasant surprise.
The fabric of the shirt feels cheap and uncomfortable.
I love the new design, it's so sleek and modern.
The user interface is confusing and hard to navigate.
Setup was a breeze, I was up and running in less than 5 minutes.
The product broke after only a week of use. Poor quality.
  `);
  isLoading = signal(false);
  error = signal<string | null>(null);
  analysisReport = signal<AnalysisReport | null>(null);

  positiveColors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
  negativeColors = ['#f43f5e', '#fb7185', '#fda4af', '#fecaca'];

  async analyzeReviews() {
    if (this.isLoading() || !this.reviewsText().trim()) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.analysisReport.set(null);

    try {
      const report = await this.geminiService.analyzeReviews(this.reviewsText());
      this.analysisReport.set(report);
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }

  handleTextareaInput(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    this.reviewsText.set(textarea.value);
  }
}
