export class Instagram {
  private _interval: number;
  private _timeoutId: number | null;

  private _mainRoleName: string;
  private _articleRoleName: string;
  private _likeButtonElementClassName: string;

  constructor() {
    this._interval = 3000;
    this._timeoutId = null;

    this._mainRoleName = 'main';
    this._articleRoleName = 'presentation';
    this._likeButtonElementClassName = '._aamw';
  }

  // 対象 dom のロード完了
  private getMainElement = (document: Document): HTMLElement | null => {
    const mainElement = document.querySelector(`main[role=${this._mainRoleName}]`) as HTMLElement | null;
    return mainElement;
  }

  // 投稿を取得
  private getArticleElements = (element: HTMLElement): HTMLElement[] => {
    const articleElements = (Array.from(element.querySelectorAll(`article[role="${this._articleRoleName}"]`)) || []) as HTMLElement[];
    return articleElements;
  }

  // いいねしていない投稿を摘出
  private getNotLikeArticleElements = (articleElements: HTMLElement[]): HTMLElement[] => {
    const response = articleElements.reduce((prev: HTMLElement[], cur: HTMLElement) => {
      const likeButtonElement = cur.querySelector(this._likeButtonElementClassName)?.firstChild as HTMLElement;
      if (!likeButtonElement) {
        return prev;
      }
      return likeButtonElement.childElementCount === 2 ? [likeButtonElement, ...prev] :  prev;
    },[]);

    return response;
  }



  private launchLikeArticles = async (articleElements: HTMLElement[]) => {
    const promise = articleElements.map((element) => {
      return new Promise((resolve, _) => {
        element.click();
        resolve('');
      });
    });
    console.info('launch: ', promise.length);
    Promise.all(promise);
  }


  // public 表示範囲に入っている投稿に対していいねをする
  public fetchLikeArticle = async (document: Document) => {
    const mainElement = this.getMainElement(document);
    if (!mainElement) {
      console.error('mainElement is empty');
      return;
    }

    const articleElements = this.getArticleElements(mainElement);
    const notLikeElements = this.getNotLikeArticleElements(articleElements);

    // ここでいいねをする
    if (this._timeoutId !== null) {
      clearTimeout(this._timeoutId);
    }
    this._timeoutId = window.setTimeout(this.launchLikeArticles, this._interval, notLikeElements);
    return;
  }
}