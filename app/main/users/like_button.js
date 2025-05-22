'use strict';

// React 요소를 생성하기 위한 간단한 참조 변수
const e = React.createElement;

// LikeButton 컴포넌트 정의
class LikeButton extends React.Component {
  // 생성자에서 초기 상태 설정
  constructor(props) {
    super(props);
    this.state = { liked: false }; // liked 상태는 처음에는 false
  }

  // 렌더링 함수
  render() {
    // 사용자가 이미 좋아요를 눌렀다면
    if (this.state.liked) {
      return 'You liked comment number ' + this.props.commentID;
    }

    // 사용자가 아직 좋아요를 누르지 않았다면, 좋아요 버튼을 표시
    return e(
      'button',
      // 버튼 클릭 시 상태를 liked: true로 설정
      { onClick: () => this.setState({ liked: true }) },
      '클릭'
    );
  }
}

// 페이지 내의 모든 .like_button_container 요소를 찾아서
document.querySelectorAll('.like_button_container')
  .forEach(domContainer => {
    // 각 컨테이너의 data-commentid 속성으로부터 commentID를 읽어옴
    const commentID = parseInt(domContainer.dataset.commentid, 10);
    
    // ReactDOM의 새로운 root API를 사용하여 DOM 컨테이너에 React 컴포넌트를 렌더링
    const root = ReactDOM.createRoot(domContainer);
    root.render(
      // LikeButton 컴포넌트를 렌더링하며, commentID 속성을 전달
      e(LikeButton, { commentID: commentID })
    );
  });
