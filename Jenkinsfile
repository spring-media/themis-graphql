@Library("sharedLibraries")

def parent = "red"
def project = "red-gql"

node("jenkins-agent-npm") {

  buildNpm(
    parent: "${parent}",
    project: "${project}"
  )

}
