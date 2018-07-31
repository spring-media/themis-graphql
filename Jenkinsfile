@Library("sharedLibraries")

def parent = "red"
def project = "red-gql"

// step 1: build Docker image
def imageTag = buildDockerContainer(
	parent: "${parent}",
	project: "${project}"
)

//// step 2: deploy in K8s cluster (dev, stg, prd)
//deployKubernetes(
//	project: "${project}",
//	imageTag: "${imageTag}"
//)
