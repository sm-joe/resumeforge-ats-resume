"""Restrict resume link schemes to HTTP and HTTPS."""

import pytest
from pydantic import ValidationError
from resumeforge_api.models import Link, Project, Certification


@pytest.mark.parametrize("value", [
    "javascript:alert(1)", "data:text/html,hello", "file:///etc/passwd",
    "https://user:password@example.com/private", "https://example.com\nInjected: header",
])
def test_reject_unsafe_profile_links(value):
    with pytest.raises(ValidationError):
        Link(label="Example", url=value)


def test_accept_https_link():
    assert Link(label="Portfolio", url="https://example.com/projects").url == "https://example.com/projects"


@pytest.mark.parametrize("model,data", [
    (Project, {"id": "p1", "name": "Project", "url": "javascript:alert(1)"}),
    (Certification, {"id": "c1", "name": "Credential", "url": "data:text/html,invalid"}),
])
def test_reject_unsafe_optional_links(model, data):
    with pytest.raises(ValidationError):
        model(**data)


def test_optional_blank_link_remains_compatible_with_editor():
    assert Project(id="p1", name="Project", url="").url == ""
    assert Certification(id="c1", name="Credential", url="").url == ""
