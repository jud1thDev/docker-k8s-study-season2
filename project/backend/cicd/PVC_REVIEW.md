# H2 DB PVC/PV 방식 검토

## ✅ 실습 목적에 적합한 이유

### 1. **데이터 영속성 학습**
- Pod가 재시작되거나 삭제되어도 데이터가 유지됨
- Kubernetes의 영속 볼륨(Persistent Volume) 개념을 실습할 수 있음
- PVC/PV의 동작 방식을 직접 경험할 수 있음

### 2. **H2 DB 특성상 적합**
- H2는 파일 기반 데이터베이스이므로 PVC/PV 방식이 자연스럽게 맞음
- 단일 파일로 데이터를 저장하므로 볼륨 마운트가 간단함
- 개발/테스트 환경에서 널리 사용되는 방식

### 3. **실습 복잡도**
- 실습 목적에 적절한 수준의 복잡도
- StatefulSet보다 간단하면서도 영속성 개념을 학습할 수 있음

## ⚠️ 주의사항 및 제한사항

### 1. **단일 Pod 제한**
- H2는 단일 프로세스용 데이터베이스
- 여러 Pod로 스케일링할 경우 데이터 일관성 문제 발생
- **replicas: 1**로 설정해야 함 (deployment.yaml에 반영됨)

### 2. **ReadWriteOnce 접근 모드**
- PVC의 accessModes를 `ReadWriteOnce`로 설정
- 한 번에 하나의 Pod만 마운트 가능
- 이는 H2의 특성과도 일치함

### 3. **StorageClass 선택**
- 로컬 환경(minikube, kind 등): `hostPath` 또는 기본 StorageClass 사용
- 클라우드 환경(AWS, GCP, Azure, OCI): 해당 클라우드의 StorageClass 사용
- 예시:
  ```yaml
  storageClassName: standard  # GKE (Google Kubernetes Engine)
  storageClassName: gp2       # EKS (Amazon Elastic Kubernetes Service)
  storageClassName: managed-premium  # AKS (Azure Kubernetes Service)
  storageClassName: oci-bv     # OKE (Oracle Kubernetes Engine) - Block Volume
  storageClassName: oci        # OKE (Oracle Kubernetes Engine) - 기본 Block Volume
  ```
  
  **오라클 클라우드(OCI) 참고사항:**
  - OKE에서는 기본적으로 `oci-bv` 또는 `oci` StorageClass 사용
  - Block Volume은 ReadWriteOnce 모드를 지원하므로 H2 DB에 적합
  - StorageClass를 명시하지 않으면 기본 StorageClass가 자동으로 사용됨

## 📋 실습 시나리오

### 시나리오 1: Pod 재시작 테스트
1. API를 호출하여 데이터 생성 (+1)
2. Pod를 삭제하고 재생성
3. 데이터가 유지되는지 확인

### 시나리오 2: PVC 삭제/재생성 테스트
1. 데이터 생성 후 PVC 삭제
2. PVC 재생성 후 Pod 재시작
3. 데이터 손실 확인 (PVC 삭제 시 데이터도 삭제됨)

### 시나리오 3: PV와 PVC의 관계 이해
1. PV와 PVC의 바인딩 과정 관찰
2. StorageClass의 동적 프로비저닝 이해

## 🔄 대안 방식 (참고용)

### 1. **EmptyDir (임시 저장)**
- Pod 삭제 시 데이터도 삭제됨
- 영속성 학습에는 부적합하지만, 간단한 테스트에는 사용 가능

### 2. **StatefulSet + PVC**
- 더 복잡하지만 실제 운영 환경에 가까움
- 여러 Pod를 사용할 수 있지만, H2는 단일 Pod만 지원

### 3. **외부 데이터베이스 (MySQL, PostgreSQL)**
- 실제 운영 환경에 가장 가까움
- 하지만 실습 목적에는 과할 수 있음

## ✅ 결론

**PVC/PV 방식을 사용하는 것이 실습 목적에 매우 적합합니다.**

- ✅ Kubernetes의 영속 볼륨 개념 학습
- ✅ 데이터 영속성 이해
- ✅ 적절한 복잡도
- ✅ H2 DB 특성과 잘 맞음

단, **단일 Pod 제한**과 **StorageClass 선택**에 주의하면 됩니다.

