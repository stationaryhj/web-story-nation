# StoryNation Frontend


## eslint 규칙 및 설정
1. 파일 이름은 대문자로 시작하지 않는다.
2. 컴포넌트 파일은 대문자로 시작한다.

인터페이스 = 파스칼케이스
메서드 = 카멜케이스,스네이크케이스,어퍼케이스
펑션 = 카멜케이스, 파스칼케이스,
이넘 = 카멜,파스칼,어퍼
클레스 = 파스칼
임포트 = 카멜,파스칼



## 스켈레톤 UI 컴포넌트

이 프로젝트는 데이터 로딩 상태를 표시하기 위한 다양한 스켈레톤 UI 컴포넌트를 제공합니다.

### 설치된 라이브러리

- `react-loading-skeleton`: 스켈레톤 UI를 쉽게 구현할 수 있는 라이브러리

### 사용 가능한 컴포넌트

프로젝트에서는 다음과 같은 스켈레톤 컴포넌트를 제공합니다:

1. **BaseSkeleton**: 기본 스켈레톤 컴포넌트
2. **TextSkeleton**: 텍스트 로딩을 위한 스켈레톤
3. **CardSkeleton**: 카드 UI를 위한 스켈레톤
4. **ListItemSkeleton**: 리스트 아이템을 위한 스켈레톤
5. **TableSkeleton**: 테이블을 위한 스켈레톤
6. **ProfileSkeleton**: 프로필 UI를 위한 스켈레톤
7. **GridSkeleton**: 그리드 레이아웃을 위한 스켈레톤

### 사용 방법

```tsx
// 컴포넌트 가져오기
import { 
  TextSkeleton, 
  CardSkeleton, 
  ListItemSkeleton 
} from '@/components/ui/skeleton';

// 컴포넌트에서 사용하기
function MyComponent() {
  const { data, isLoading } = useQuery(...);

  return (
    <div>
      {isLoading ? (
        <CardSkeleton /> // 로딩 중일 때 스켈레톤 표시
      ) : (
        // 데이터가 로드된 후 실제 컨텐츠 표시
        <div>
          <h2>{data.title}</h2>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
}
```

### 테마 설정

스켈레톤 UI의 테마를 전역적으로 설정하려면 `SkeletonThemeProvider`를 사용합니다:

```tsx
import { SkeletonThemeProvider } from '@/components/ui/skeleton';

function App({ children }) {
  return (
    <SkeletonThemeProvider
      baseColor="#E5E7EB"
      highlightColor="#F3F4F6"
      borderRadius="0.25rem"
      duration={1.5}
    >
      {children}
    </SkeletonThemeProvider>
  );
}
```

### 예제 페이지

스켈레톤 UI 컴포넌트의 사용 예제는 `/skeleton-example` 페이지에서 확인할 수 있습니다.

## 기타 프로젝트 정보

(기존 README 내용 유지) 