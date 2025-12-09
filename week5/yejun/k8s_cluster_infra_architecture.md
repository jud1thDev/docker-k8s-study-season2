# k8s infra architecture 구성하기

## RA ( [Reference Architecture](https://docs.oracle.com/en-us/iaas/Content/ContEng/Concepts/contengnetworkconfigexample.htm#example-oci-cni-privatek8sapi_privateworkers_publiclb) )
<img width="1076" height="600" alt="image" src="https://github.com/user-attachments/assets/7c985395-abe8-4604-8414-60853fc4cc5a" />

해당 아키텍처를 기반으로 AWS의 리소스를 활용하여 구현 단, OKE와 같은 EKS 리소스가 아닌 직접 클러스터 인프라 환경 성

# AWS Resource Architecture
<img width="798" height="942" alt="2" src="https://github.com/user-attachments/assets/daf4c81f-8616-43c1-a208-10da6ac113c8" />

___
# VPN 구성 정보

| 항목 | 값 |
|------|-----|
| **VPN Name** | k8s-cluster |
| **CIDR Block** | 172.31.0.0/16 |
| **DNS Resolution** | Enabled |
| **DNS Hostnames** | Enabled |
| **Internet Gateway** | internet-gateway-0 |
| **NAT Gateway** | nat-gateway-0 |
| **VPC Endpoints** | All relevant AWS Services via Gateway/Interface Endpoints (초기구성 시 필요 서비스만 지정 (s3)) |
| **DHCP Options** | Default DHCP Option Set |

# Subnet 구성 정보

## Private Subnet for Kubernetes API Endpoint

| 항목 | 값 |
|------|-----|
| **Name** | KubernetesAPIendpoint |
| **Type** | Regional |
| **CIDR Block** | 172.31.0.0/29 |
| **Route Table** | rtb-KubernetesAPIendpoint |
| **Subnet Access** | Private |
| **DNS Resolution** | Selected |
| **DHCP Options** | Default |
| **Security Group** | sg-k8s-api-endpoint |

---

## Private Subnet for Worker Nodes

| 항목 | 값 |
|------|-----|
| **Name** | workernodes |
| **Type** | Regional |
| **CIDR Block** | 172.31.1.0/24 |
| **Route Table** | rtb-workernodes |
| **Subnet Access** | Private |
| **DNS Resolution** | Selected |
| **DHCP Options** | Default |
| **Security Group** | sg-worker-nodes |

---

## Public Subnet for Service Load Balancers

| 항목 | 값 |
|------|-----|
| **Name** | loadbalancers |
| **Type** | Regional |
| **CIDR Block** | 172.31.2.0/24 |
| **Route Table** | rtb-loadbalancers |
| **Subnet Access** | Public |
| **DNS Resolution** | Selected |
| **DHCP Options** | Default |
| **Security Group** | sg-lb |

---

## Public Subnet for Bastion

| 항목 | 값 |
|------|-----|
| **Name** | bastion |
| **Type** | Regional |
| **CIDR Block** | 172.31.3.0/24 |
| **Subnet Access** | Private |
| **DNS Resolution** | Selected |
| **DHCP Options** | Default |
| **Security Group** | sg-bastion |

# AWS Route Table 구성 정보

---

## Route Table for Kubernetes API Endpoint Subnet

| 항목 | 값 |
|------|-----|
| **Name** | rtb-k8s-api-endpoint |

### Route Rules

| Destination | Target |
|-------------|---------|
| 0.0.0.0/0 | NAT Gateway (nat-gateway-0) |
| AWS Services (S3, etc.) | VPC Endpoint (Gateway or Interface) |

---

## Route Table for Worker Nodes Subnet

| 항목 | 값 |
|------|-----|
| **Name** | rtb-worker-nodes |

### Route Rules

| Destination | Target |
|-------------|---------|
| AWS Services | VPC Endpoint (Gateway or Interface) |

---

## Route Table for Pods Subnet

| 항목 | 값 |
|------|-----|
| **Name** | rtb-pods |

### Route Rules

| Destination | Target |
|-------------|---------|
| 0.0.0.0/0 | NAT Gateway (nat-gateway-0) |
| AWS Services | VPC Endpoint |

---

## Route Table for Public Load Balancers Subnet

| 항목 | 값 |
|------|-----|
| **Name** | rtb-loadbalancers |

### Route Rules

| Destination | Target |
|-------------|---------|
| 0.0.0.0/0 | Internet Gateway (igw-0) |

# Security groupts and NACL

## sg-k8s-api-endpoint

### Ingress
| Source       | Protocol | Port  | Description                              |
| ------------ | -------- | ----- | ---------------------------------------- |
| 172.31.1.0/24  | TCP      | 6443  | Worker → API Server (Kubelet 인증/통신)      |
| 172.31.1.0/24  | TCP      | 12250 | Worker → API Server (Cluster Agent 포트)   |
| 172.31.1.0/24  | ICMP     | 3,4   | Path MTU Discovery                       |
| 172.31.32.0/19 | TCP      | 6443  | Pod → API Server (CNI가 VPC native일 때)    |
| 172.31.32.0/19 | TCP      | 12250 | Pod → API Server                         |
| Bastion CIDR | TCP      | 6443  | (Optional) Bastion → API Server admin 접근 |
| Bastion CIDR | TCP      | 22          | (Optional) SSH to Worker Nodes    |

### Egress
| Destination         | Protocol | Port  | Description                       |
| ------------------- | -------- | ----- | --------------------------------- |
| AWS Services (VPCE) | TCP      | ALL   | API Server → EKS/Cloud services   |
| AWS Services (VPCE) | ICMP     | 3,4   | Path MTU Discovery                |
| 172.31.1.0/24         | TCP      | 10250 | API Server → Worker (kubelet API) |
| 172.31.1.0/24         | ICMP     | 3,4   | Path MTU Discovery                |
| 172.31.32.0/19        | ALL      | ALL   | API Server → Pods                 |
| 172.31.3.0/24  | ssh      | 22       | bastion to ssh                   |


## sg-worker-nodes

### Ingress
| Source       | Protocol | Port        | Description                       |
| ------------ | -------- | ----------- | --------------------------------- |
| 172.31.0.0/29  | TCP      | 10250       | API Server → Worker (kubelet API) |
| 0.0.0.0/0    | ICMP     | 3,4         | Path MTU Discovery                |
| Bastion CIDR | TCP      | 22          | (Optional) SSH to Worker Nodes    |
| 172.31.2.0/24  | ALL      | 30000–32767 | Load balancer → NodePorts         |
| 172.31.2.0/24  | ALL      | 10256       | LB → kube-proxy                   |
| 172.31.3.0/24  | ssh      | 22       | bastion to ssh                   |


### Egress
| Destination         | Protocol | Port  | Description                |
| ------------------- | -------- | ----- | -------------------------- |
| 172.31.32.0/19        | ALL      | ALL   | Worker → Pods              |
| 0.0.0.0/0           | ICMP     | 3,4   | Path MTU Discovery         |
| AWS Services (VPCE) | TCP      | ALL   | Worker → AWS Control Plane |
| 172.31.0.0/29         | TCP      | 6443  | Worker → API Server        |
| 172.31.0.0/29         | TCP      | 12250 | Worker → API Server        |

## sg-loadbalancers

### Ingress
| Source                     | Protocol | Port         | Description              |
| -------------------------- | -------- | ------------ | ------------------------ |
| 0.0.0.0/0 or specific CIDR | TCP/UDP  | App-specific | LB Listener (예: 80, 443) |

### Egress
| Destination | Protocol | Port        | Description     |
| ----------- | -------- | ----------- | --------------- |
| 172.31.1.0/24 | ALL      | 30000–32767 | LB → NodePort   |
| 172.31.1.0/24 | ALL      | 10256       | LB → kube-proxy |

## sg-bastion

### Ingress
| Source                     | Protocol | Port         | Description              |
| -------------------------- | -------- | ------------ | ------------------------ |
| 0.0.0.0/0 | TCP  | 22 | (Optional) SSH  |

### Egress
| Destination | Protocol | Port | Description               |
| ----------- | -------- | ---- | ------------------------- |
| 172.31.0.0/29 | TCP      | 6443 | (Optional) kubectl API 호출 |
| 172.31.0.0/29 | TCP  | 22 | (Optional) SSH to api-endpoints |
| 172.31.1.0/24 | TCP      | 22   | (Optional) SSH to Worker  |

